import { DialogTrigger } from "react-aria-components"

import { Button } from "@/components/Buttons"
import { Modal } from "@/components/Modal"
import { RotatingLoader } from "@/components/RoatingLoader"
import { FilePreview } from "@/pages/recipe-detail/FilePreview"

export type FileUpload = {
  localId: string | undefined
  url: string
  progress?: number
  contentType: string
  state: "loading" | "failed" | "success"
}

function DeleteFileButton({
  removeFile,
  fileId,
}: {
  fileId: string | undefined
  removeFile: (fileId: string | undefined) => void
}) {
  return (
    <DialogTrigger>
      <Button
        className="absolute right-0 top-[-4px] z-10 aspect-[1] cursor-pointer rounded-[100%] border-[0px] bg-[#4a4a4a] p-[0.3rem] font-bold leading-[0] text-[#dbdbdb]"
        variant="nostyle"
      >
        &times;
      </Button>
      <Modal title="Delete File">
        <div className="flex flex-col gap-2">
          <div>Are you sure you want to delete this file?</div>
          <div className="flex gap-2">
            <Button>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                removeFile(fileId)
              }}
            >
              Delete File
            </Button>
          </div>
        </div>
      </Modal>
    </DialogTrigger>
  )
}
function FileWithStatus({
  url,
  contentType,
  backgroundUrl,
  state,
  progress,
}: {
  url: string
  contentType: string
  backgroundUrl: string | null
  state: FileUpload["state"]
  progress?: number
}) {
  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="relative"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <FilePreview
          contentType={contentType}
          isLoading={state === "loading"}
          src={url}
          backgroundUrl={backgroundUrl}
        />
        {progress != null &&
          // hide the progress bar once it is complete
          progress !== 100 && (
            <div className="absolute inset-0 z-10 flex w-[100px] items-end justify-center">
              <progress
                value={progress}
                max="100"
                className="h-[0.2rem] rounded-none accent-[--color-primary]"
              />
            </div>
          )}
      </a>
      {state === "failed" && (
        <div className="absolute inset-0 flex" title="Image upload failed">
          <div className="m-auto text-[2rem]">❌</div>
        </div>
      )}
      {state === "loading" && (
        <div className="absolute inset-0 flex" title="Image uploading...">
          <RotatingLoader />
        </div>
      )}
    </>
  )
}

export function FileUploader({
  addFiles,
  removeFile,
  files,
}: {
  addFiles: (files: FileList) => Promise<void>
  removeFile: (fileId: string | undefined) => void
  files: FileUpload[]
}) {
  return (
    <>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1 border-[thin] border-solid border-[--color-border] bg-[--color-background-card] p-2 [border-top-style:none]">
          {files.map((f) => (
            // NOTE(sbdchd): it's important that the `localId` is consistent
            // throughout the upload content, otherwise we'll wipe out the DOM
            // node and there will be a flash as the image changes.
            <div key={f.localId} className="relative">
              <FileWithStatus
                progress={f.progress}
                url={f.url}
                contentType={f.contentType}
                state={f.state}
                backgroundUrl={null}
              />
              <DeleteFileButton fileId={f.localId} removeFile={removeFile} />
            </div>
          ))}
        </div>
      )}
      <label className="mb-2 cursor-pointer rounded-b-[3px] border-[thin] border-solid border-[--color-border] bg-[--color-background-card] px-2 py-1 text-sm font-medium text-[--color-text-muted] [border-top-style:none]">
        {/* eslint-disable-next-line react/forbid-elements */}
        <input
          type="file"
          multiple
          accept="image/jpeg, image/png, application/pdf"
          className="hidden"
          onChange={(e) => {
            const newFiles = e.target.files
            if (newFiles != null) {
              void addFiles(newFiles)
              // we want to clear the file input so we can repeatedly upload the
              // same file.
              //
              // @ts-expect-error types don't allow this, but it works
              e.target.value = null
            }
          }}
        />
        Paste, drop, or click to add files
      </label>
    </>
  )
}
