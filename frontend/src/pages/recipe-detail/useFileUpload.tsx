import produce from "immer"
import React, { useEffect, useRef } from "react"

import { FileUpload } from "@/pages/recipe-detail/FileUploader"
import { UploadSuccess } from "@/pages/recipe-detail/Notes"
import { useUploadCreate } from "@/queries/useUploadCreate"
import { notUndefined } from "@/typeguard"
import { uuid4 } from "@/uuid"

type InProgressUpload = {
  readonly type: "in-progress"
  readonly url: string
  readonly file: File
  readonly localId: string
  readonly contentType: string
  readonly progress: number
  readonly state: FileUpload["state"]
}

function useIsMounted() {
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  return isMounted
}
// todo: clear changes on cancellation
export function useFileUpload(
  addUploads: (upload: UploadSuccess) => void,
  removeUploads: (uploadIds: string[]) => void,
  remoteFiles: readonly UploadSuccess[],
  resetUploads: () => void,
  recipeId: number,
) {
  const [localImages, setLocalImages] = React.useState<InProgressUpload[]>([])
  const uploadCreate = useUploadCreate()
  const isMounted = useIsMounted()

  const addFiles = async (files: FileList) => {
    const uploadPromises: Promise<void>[] = []
    for (const file of files) {
      const fileId = uuid4()
      setLocalImages((s) => {
        return [
          {
            id: fileId,
            file,
            localId: fileId,
            url: URL.createObjectURL(file),
            contentType: file.type,
            state: "loading",
            progress: 0,
            type: "in-progress",
          } as const,
          ...s,
        ]
      })
      uploadPromises.push(
        uploadCreate
          .mutateAsync({
            file,
            purpose: "recipe",
            recipeId,
            onProgress(progress) {
              setLocalImages(
                produce((s) => {
                  const f = s.find((x) => x.localId === fileId)
                  if (f) {
                    f.progress = progress
                  }
                }),
              )
            },
          })
          .then((res) => {
            if (!isMounted) {
              return
            }
            addUploads({
              ...res,
              type: "upload",
              localId: fileId,
              backgroundUrl: null,
              isPrimary: false,
            })
            setLocalImages(
              produce((s) => {
                const f = s.find((x) => x.localId === fileId)
                if (f) {
                  f.state = "success"
                }
              }),
            )
          })
          .catch(() => {
            if (!isMounted) {
              return
            }
            setLocalImages(
              produce((s) => {
                const existingUpload = s.find((x) => x.localId === fileId)
                if (existingUpload) {
                  existingUpload.state = "failed"
                }
              }),
            )
          }),
      )
    }
    await Promise.allSettled(uploadPromises)
  }

  const removeFile = (localId: string | undefined) => {
    setLocalImages((s) => s.filter((x) => x.localId !== localId))
    if (localId == null) {
      return
    }
    removeUploads([localId])
  }

  const orderedImages: FileUpload[] = [
    ...localImages,
    ...remoteFiles
      .filter(
        (i) =>
          i.localId != null &&
          !localImages
            .map((x) => x.localId)
            .filter(notUndefined)
            .includes(i.localId),
      )
      .map(
        (x) =>
          ({
            localId: x.localId,
            url: x.url,
            contentType: x.contentType,
            state: "success",
          }) as const,
      ),
  ]

  const reset = () => {
    setLocalImages([])
    resetUploads()
  }

  return {
    addFiles,
    removeFile,
    files: orderedImages,
    reset,
    hasUnsavedImages: !!localImages.find((x) => x.state === "loading"),
  } as const
}
