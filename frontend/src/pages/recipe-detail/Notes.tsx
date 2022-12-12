import produce from "immer"
import flatten from "lodash/flatten"
import orderBy from "lodash-es/orderBy"
import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import Textarea from "react-textarea-autosize"

import * as api from "@/api"
import { classNames as cls } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons"
import { Markdown } from "@/components/Markdown"
import { RotatingLoader } from "@/components/RoatingLoader"
import { formatAbsoluteDateTime, formatHumanDateTime } from "@/date"
import { useCurrentUser, useDispatch, useGlobalEvent } from "@/hooks"
import { Gallery } from "@/pages/recipe-detail/ImageGallery"
import {
  findReaction,
  Reaction,
  ReactionPopover,
  ReactionsFooter,
  ReactionType,
} from "@/pages/recipe-detail/Reactions"
import { isOk } from "@/result"
import {
  INote,
  IRecipe,
  patchRecipe,
  RecipeTimelineItem,
  TimelineItem,
  Upload,
} from "@/store/reducers/recipes"
import { showNotificationWithTimeoutAsync } from "@/store/thunks"
import { styled } from "@/theme"
import { notUndefined } from "@/utils/general"
import { uuid4 } from "@/uuid"

interface IUseNoteEditHandlers {
  readonly note: INote
  readonly recipeId: IRecipe["id"]
}
function useNoteEditHandlers({ note, recipeId }: IUseNoteEditHandlers) {
  const dispatch = useDispatch()
  const [draftText, setNewText] = useState(note.text)
  useEffect(() => {
    setNewText(note.text)
  }, [note.text])
  const [isEditing, setIsEditing] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [uploadedImages, setUploads] = React.useState<UploadSuccess[]>(
    note.attachments.map((x) => ({ ...x, localId: x.id })),
  )

  const onSave = () => {
    setIsUpdating(true)
    void api
      .updateNote({
        noteId: note.id,
        note: draftText,
        attachmentUploadIds: uploadedImages.map((x) => x.id),
      })
      .then((res) => {
        if (isOk(res)) {
          dispatch(
            patchRecipe({
              recipeId,
              updateFn: (recipe) => {
                return {
                  ...recipe,
                  timelineItems: [
                    ...recipe.timelineItems.filter((x) => x.id !== note.id),
                    res.data,
                  ],
                }
              },
            }),
          )
          setIsEditing(false)
        }
        setIsUpdating(false)
      })
  }
  const setEditing = (value: boolean) => {
    setIsEditing(value)
  }
  const onCancel = () => {
    setEditing(false)
  }
  const onDelete = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      void api.deleteNote({ noteId: note.id }).then((res) => {
        if (isOk(res)) {
          dispatch(
            patchRecipe({
              recipeId,
              updateFn: (recipe) => {
                return {
                  ...recipe,
                  timelineItems: recipe.timelineItems.filter(
                    (x) => x.id !== note.id,
                  ),
                }
              },
            }),
          )
        }
      })
    }
  }
  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      onCancel()
    }
    if (e.key === "Enter" && e.metaKey) {
      onSave()
    }
  }
  const onEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewText(e.target.value)
  }
  const onNoteClick = () => {
    setEditing(true)
  }
  return {
    draftText,
    isEditing,
    isUpdating,
    onCancel,
    onDelete,
    onEditorChange,
    onEditorKeyDown,
    onNoteClick,
    onSave,
    uploadedImages,
    addUploads: (upload: UploadSuccess) => {
      setUploads((s) => [upload, ...s])
    },
    removeUploads: (localIds: string[]) => {
      setUploads((s) => {
        return s.filter((u) => !localIds.includes(u.localId))
      })
    },
    resetUploads: () => {
      setUploads(note.attachments)
    },
  }
}

const SmallTime = styled.time`
  font-size: 0.85rem;
`

function NoteTimeStamp({ created }: { readonly created: string }) {
  const date = new Date(created)
  const prettyDate = formatAbsoluteDateTime(date, { includeYear: true })
  const humanizedDate = formatHumanDateTime(date)
  return (
    <SmallTime title={prettyDate} dateTime={created} className="text-muted">
      {humanizedDate}
    </SmallTime>
  )
}

function SharedEntry({
  id,
  children,
  className,
}: {
  readonly id: string
  readonly children: React.ReactNode
  readonly className?: string
}) {
  const location = useLocation()
  const isSharedNote = location.hash === `#${id}`
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isSharedNote) {
      ref.current?.scrollIntoView()
    }
  }, [isSharedNote])
  return (
    <div
      ref={ref}
      className={cls(
        {
          "bg-highlight": isSharedNote,
        },
        className,
      )}
      id={id}
    >
      {children}
    </div>
  )
}

const AttachmentContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
`
const SmallAnchor = styled.a`
  font-size: 0.825rem;
`

interface INoteProps {
  readonly note: INote
  readonly recipeId: IRecipe["id"]
  readonly className?: string
  readonly openImage: (id: string) => void
}
export function Note({ note, recipeId, className, openImage }: INoteProps) {
  const {
    draftText,
    isEditing,
    isUpdating,
    onCancel,
    onDelete,
    onEditorChange,
    onEditorKeyDown,
    onNoteClick,
    onSave,
    addUploads,
    removeUploads,
    uploadedImages,
    resetUploads,
  } = useNoteEditHandlers({ note, recipeId })

  const user = useCurrentUser()

  const noteId = `note-${note.id}`

  const { addFiles, removeFile, files, reset } = useImageUpload(
    addUploads,
    removeUploads,
    uploadedImages,
    resetUploads,
  )

  const [reactions, setReactions] = useState<Reaction[]>(note.reactions)

  const addOrRemoveReaction = async (emoji: ReactionType) => {
    const existingReaction = findReaction(reactions, emoji, user.id ?? 0)

    setReactions((s) =>
      s.filter((reaction) => reaction.id !== existingReaction?.id),
    )
    if (existingReaction != null) {
      // remove reaction
      const res = await api.deleteReaction({ reactionId: existingReaction.id })
      if (!isOk(res)) {
        // add back reaction if we fail
        setReactions((s) => [...s, existingReaction])
      }
    } else {
      // add reaction
      const tempId = uuid4()
      setReactions((s) => [
        ...s,
        {
          id: tempId,
          created: new Date().toISOString(),
          type: emoji,
          user: {
            id: user.id || 0,
            name: user.name,
          },
        },
      ])
      const res = await api.createReaction({
        noteId: note.id.toString(),
        type: emoji,
      })
      if (isOk(res)) {
        setReactions((s) => {
          const newReactions = s.filter((reaction) => reaction.id !== tempId)
          return [...newReactions, res.data]
        })
      } else {
        setReactions((s) => {
          return s.filter((reaction) => reaction.id !== tempId)
        })
      }
    }
  }

  return (
    <SharedEntry
      className={cls("d-flex align-items-start", className)}
      id={noteId}
    >
      <Avatar avatarURL={note.created_by.avatar_url} className="mr-2" />
      <div className="w-100">
        <div className="d-flex align-items-center">
          <b>{note.created_by.name}</b>{" "}
          <a href={`#${noteId}`} className="ml-2">
            <NoteTimeStamp created={note.created} />
          </a>
          <ReactionPopover
            className="ml-auto no-print"
            onPick={async (emoji) => addOrRemoveReaction(emoji)}
            reactions={reactions}
          />
          {note.created_by.id === user.id ? (
            <SmallAnchor
              className="ml-2 text-muted cursor-pointer no-print"
              onClick={onNoteClick}
            >
              edit
            </SmallAnchor>
          ) : null}
        </div>
        {!isEditing ? (
          <div>
            <Markdown className="selectable">{note.text}</Markdown>
            <AttachmentContainer>
              {note.attachments.map((attachment) => (
                <ImagePreview
                  key={attachment.id}
                  onClick={() => {
                    openImage(attachment.id)
                  }}
                  src={attachment.url}
                  backgroundUrl={attachment.backgroundUrl}
                />
              ))}
            </AttachmentContainer>
            <ReactionsFooter
              reactions={reactions}
              onPick={async (emoji) => addOrRemoveReaction(emoji)}
              onClick={async (emoji) => addOrRemoveReaction(emoji)}
            />
          </div>
        ) : (
          <>
            <UploadContainer addFiles={addFiles}>
              <Textarea
                autoFocus
                className="my-textarea"
                onKeyDown={onEditorKeyDown}
                minRows={5}
                value={draftText}
                onChange={onEditorChange}
                placeholder="Add a note..."
              />
              {isEditing ? (
                <ImageUploader
                  addFiles={addFiles}
                  removeFile={removeFile}
                  files={files}
                />
              ) : (
                <AttachmentContainer>
                  {note.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      target="_blank"
                      rel="noreferrer"
                      href={attachment.url}
                    >
                      <ImagePreview
                        src={attachment.url}
                        backgroundUrl={attachment.backgroundUrl}
                      />
                    </a>
                  ))}
                </AttachmentContainer>
              )}
            </UploadContainer>

            {isEditing && (
              <div className="d-flex justify-between align-center">
                <ButtonSecondary
                  size="small"
                  onClick={onDelete}
                  className="mr-2"
                >
                  delete
                </ButtonSecondary>
                <div className="d-flex justify-between align-center">
                  <ButtonSecondary
                    size="small"
                    onClick={() => {
                      onCancel()
                      reset()
                    }}
                    className="mr-3"
                  >
                    cancel
                  </ButtonSecondary>
                  <ButtonPrimary
                    size="small"
                    onClick={onSave}
                    loading={isUpdating}
                  >
                    save
                  </ButtonPrimary>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </SharedEntry>
  )
}

export function TimelineEvent({
  event,
  enableLinking = true,
  className,
}: {
  readonly event: Pick<
    RecipeTimelineItem,
    "id" | "created_by" | "action" | "created"
  >
  readonly enableLinking?: boolean
  readonly className?: string
}) {
  const eventId = `event-${event.id}`
  const timestamp = <NoteTimeStamp created={event.created} />
  return (
    <SharedEntry
      id={eventId}
      className={cls("d-flex align-items-center", className)}
    >
      <Avatar
        avatarURL={event.created_by?.avatar_url ?? null}
        className="mr-2"
      />
      <div className="d-flex flex-column">
        <div>
          <b>{event.created_by?.name ?? "User"}</b>{" "}
          <span>{event.action} this recipe </span>
        </div>
        {enableLinking ? <a href={`#${eventId}`}>{timestamp}</a> : timestamp}
      </div>
    </SharedEntry>
  )
}

export const blurNoteTextArea = () => {
  const el = document.getElementById("new_note_textarea")
  if (el) {
    el.blur()
  }
}

interface IUseNoteCreatorHandlers {
  readonly recipeId: IRecipe["id"]
}

function useNoteCreatorHandlers({ recipeId }: IUseNoteCreatorHandlers) {
  const dispatch = useDispatch()
  const [draftText, setDraftText] = React.useState("")
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadedImages, setUploads] = React.useState<UploadSuccess[]>([])

  const cancelEditingNote = () => {
    setIsEditing(false)
    setDraftText("")
    setUploads([])
    blurNoteTextArea()
  }

  const onCreate = () => {
    setIsLoading(true)

    void api
      .addNoteToRecipe({
        recipeId,
        note: draftText,
        attachmentUploadIds: uploadedImages.map((x) => x.id),
      })
      .then((res) => {
        if (isOk(res)) {
          dispatch(
            patchRecipe({
              recipeId,
              updateFn: (recipe) => {
                return {
                  ...recipe,
                  timelineItems: [...recipe.timelineItems, res.data],
                }
              },
            }),
          )
          cancelEditingNote()
        } else {
          showNotificationWithTimeoutAsync(dispatch)({
            message: "problem saving note",
            level: "danger",
          })
        }
        setIsLoading(false)
      })
  }
  const onCancel = () => {
    cancelEditingNote()
  }
  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      cancelEditingNote()
    }
    if (e.key === "Enter" && e.metaKey) {
      onCreate()
    }
  }
  const onEditorFocus = () => {
    setIsEditing(true)
  }
  const onEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftText(e.target.value)
  }

  const editorText = isEditing ? draftText : ""
  const editorRowCount = !isEditing ? 1 : undefined
  const editorMinRowCount = isEditing ? 5 : 0
  const editorClassNames = cls({
    "my-textarea": isEditing,
    textarea: !isEditing,
  })

  const isDisabled = editorText === "" && uploadedImages.length === 0

  return {
    isEditing,
    onEditorKeyDown,
    editorClassNames,
    onEditorChange,
    editorMinRowCount,
    editorRowCount,
    editorText,
    onEditorFocus,
    onCreate,
    isLoading,
    onCancel,
    isDisabled,
    addUploads: (upload: UploadSuccess) => {
      setUploads((s) => [upload, ...s])
    },
    removeUploads: (localIds: string[]) => {
      setUploads((s) => {
        return s.filter((u) => !localIds.includes(u.localId))
      })
    },
    uploadedImages,
    resetUploads: () => {
      setUploads([])
    },
  }
}

interface INoteCreatorProps {
  readonly recipeId: IRecipe["id"]
  readonly className?: string
}

const DragDropLabel = styled.label`
  font-size: 0.85rem;
  cursor: pointer;
  border-style: solid;
  border-top-style: none;
  border-width: thin;
  border-color: #dbdbdb;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  padding-top: 0.1rem;
  padding-bottom: 0.1rem;
  font-weight: 500;
`

const NoteWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const ImageUploadContainer = styled.div`
  border-style: solid;
  border-top-style: none;
  border-width: thin;
  border-color: #dbdbdb;
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
`

const ImagePreviewParent = styled.div`
  position: relative;
`
const CloseButton = styled.button`
  z-index: 10;
  position: absolute;
  right: 0;
  padding: 0.3rem;
  cursor: pointer;
  top: -4px;
  border-radius: 100%;
  aspect-ratio: 1;
  line-height: 0;
  border-width: 0;
  background-color: #4a4a4a;
  color: #dbdbdb;
  font-weight: 700;
`

function formatUrlImgix100(url: string): string {
  if (url.startsWith("blob:")) {
    return url
  }
  const u = new URL(url)
  u.searchParams.set("w", "100")
  u.searchParams.set("h", "100")
  u.searchParams.set("dpr", "2")
  return u.href
}

const Image100Px = styled.img<{
  readonly isLoading?: boolean
  readonly src: string
}>`
  height: 100px;
  width: 100px;
  border-radius: 3px;
  object-fit: cover;
  filter: ${(props) => (props.isLoading ? "grayscale(100%)" : "unset")};
`
function ImagePreview({
  src,
  isLoading,
  backgroundUrl,
  onClick,
}: {
  src: string
  isLoading?: boolean
  backgroundUrl: string | null
  onClick?: () => void
}) {
  return (
    <div className="d-grid" onClick={onClick}>
      <Image100Px
        src={formatUrlImgix100(src)}
        isLoading={isLoading}
        style={{
          gridArea: "1 / 1",
          zIndex: 10,
        }}
      />
      {backgroundUrl != null && (
        <div
          style={{
            gridArea: "1 / 1",
            backgroundImage: `url(${backgroundUrl})`,
          }}
          className="blurred-filter"
        />
      )}
    </div>
  )
}

const LoaderContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
`

const BrokenImageContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
`

const BrokenImage = styled.div`
  margin: auto;
  font-size: 2rem;
`

// todo: clear changes on cancellation
function useImageUpload(
  addUploads: (upload: UploadSuccess) => void,
  removeUploads: (uploadIds: string[]) => void,
  remoteImages: Upload[],
  resetUploads: () => void,
) {
  const [localImages, setLocalImages] = React.useState<InProgressUpload[]>([])

  const addFiles = (files: FileList) => {
    for (const file of files) {
      const fileId = uuid4()
      setLocalImages((s) => {
        return [
          {
            id: fileId,
            file,
            localId: fileId,
            url: URL.createObjectURL(file),
            state: "loading",
            progress: 0,
            type: "in-progress",
          } as const,
          ...s,
        ]
      })
      void api
        .uploadImage({
          image: file,
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
          if (isOk(res)) {
            addUploads({
              ...res.data,
              type: "upload",
              localId: fileId,
              backgroundUrl: null,
            })
            setLocalImages(
              produce((s) => {
                const f = s.find((x) => x.localId === fileId)
                if (f) {
                  f.state = "success"
                }
              }),
            )
          } else {
            setLocalImages(
              produce((s) => {
                const existingUpload = s.find((x) => x.localId === fileId)
                if (existingUpload) {
                  existingUpload.state = "failed"
                }
              }),
            )
          }
        })
    }
  }

  const removeFile = (localId: string) => {
    setLocalImages((s) => s.filter((x) => x.localId !== localId))
    removeUploads([localId])
  }

  const orderedImages: ImageUpload[] = [
    ...localImages,
    ...remoteImages
      .filter(
        (i) =>
          !localImages
            .map((x) => x.localId)
            .filter(notUndefined)
            .includes(i.localId),
      )
      .map(
        (x) => ({ localId: x.localId, url: x.url, state: "success" } as const),
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
  } as const
}

const ImageAnchor = styled.a`
  position: relative;
`

const ProgressBarContainer = styled.div`
  z-index: 10;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100px;
  display: flex;
  align-items: end;
  justify-content: center;
`

const StyledProgress = styled.progress`
  height: 0.2rem;
  border-radius: 0;
`

function ImageWithStatus({
  url,
  backgroundUrl,
  state,
  progress,
}: {
  url: string
  backgroundUrl: string | null
  state: ImageUpload["state"]
  progress?: number
}) {
  return (
    <>
      <ImageAnchor
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <ImagePreview
          isLoading={state === "loading"}
          src={url}
          backgroundUrl={backgroundUrl}
        />
        {progress != null && (
          <ProgressBarContainer>
            <StyledProgress
              value={progress}
              max="100"
              className="progress is-primary"
            />
          </ProgressBarContainer>
        )}
      </ImageAnchor>
      {state === "failed" && (
        <BrokenImageContainer title="Image upload failed">
          <BrokenImage>❌</BrokenImage>
        </BrokenImageContainer>
      )}
      {state === "loading" && (
        <LoaderContainer title="Image uploading...">
          <RotatingLoader />
        </LoaderContainer>
      )}
    </>
  )
}

type InProgressUpload = {
  readonly type: "in-progress"
  readonly url: string
  readonly file: File
  readonly localId: string
  readonly progress: number
  readonly state: ImageUpload["state"]
}

type UploadSuccess = Upload

type ImageUpload = {
  localId: string
  url: string
  progress?: number
  state: "loading" | "failed" | "success"
}

function ImageUploader({
  addFiles,
  removeFile,
  files,
}: {
  addFiles: (files: FileList) => void
  removeFile: (fileId: string) => void
  files: ImageUpload[]
}) {
  return (
    <>
      {files.length > 0 && (
        <ImageUploadContainer>
          {files.map((f) => (
            // NOTE(sbdchd): it's important that the `localId` is consistent
            // throughout the upload content, otherwise we'll wipe out the DOM
            // node and there will be a flash as the image changes.
            <ImagePreviewParent key={f.localId}>
              <ImageWithStatus
                progress={f.progress}
                url={f.url}
                state={f.state}
                backgroundUrl={null}
              />
              <CloseButton
                onClick={() => {
                  if (confirm("Remove image?")) {
                    removeFile(f.localId)
                  }
                }}
              >
                &times;
              </CloseButton>
            </ImagePreviewParent>
          ))}
        </ImageUploadContainer>
      )}
      <DragDropLabel className="text-muted mb-2">
        <input
          type="file"
          multiple
          accept="image/jpeg, image/png"
          style={{ display: "none" }}
          onChange={(e) => {
            const newFiles = e.target.files
            if (newFiles != null) {
              addFiles(newFiles)
              // we want to clear the file input so we can repeatedly upload the
              // same file.
              //
              // @ts-expect-error types don't allow this, but it works
              e.target.value = null
            }
          }}
        />
        Attach images by dragging & dropping, selecting or pasting them.
      </DragDropLabel>
    </>
  )
}

function UploadContainer({
  addFiles,
  children,
}: {
  children: React.ReactNode
  addFiles: (files: FileList) => void
}) {
  return (
    <NoteWrapper
      onDragOver={(event) => {
        event.dataTransfer.dropEffect = "copy"
      }}
      onDrop={(event) => {
        if (event.dataTransfer?.files) {
          const newFiles = event.dataTransfer.files
          addFiles(newFiles)
        }
      }}
    >
      {children}
    </NoteWrapper>
  )
}

function NoteCreator({ recipeId, className }: INoteCreatorProps) {
  const {
    isEditing,
    onEditorKeyDown,
    editorClassNames,
    onEditorChange,
    editorMinRowCount,
    editorRowCount,
    editorText,
    onEditorFocus,
    onCreate,
    isLoading,
    onCancel,
    isDisabled,
    addUploads,
    removeUploads,
    uploadedImages,
    resetUploads,
  } = useNoteCreatorHandlers({
    recipeId,
  })

  const { addFiles, removeFile, files, reset } = useImageUpload(
    addUploads,
    removeUploads,
    uploadedImages,
    resetUploads,
  )

  return (
    <div className={className}>
      <UploadContainer addFiles={addFiles}>
        <Textarea
          id="new_note_textarea"
          className={editorClassNames}
          onKeyDown={onEditorKeyDown}
          minRows={editorMinRowCount}
          rows={editorRowCount}
          value={editorText}
          onFocus={onEditorFocus}
          onChange={onEditorChange}
          placeholder="Add a note..."
        />
        {isEditing && (
          <ImageUploader
            addFiles={addFiles}
            removeFile={removeFile}
            files={files}
          />
        )}
      </UploadContainer>

      {isEditing && (
        <div className="d-flex justify-end align-center">
          <ButtonSecondary
            size="small"
            className="mr-3"
            onClick={() => {
              onCancel()
              reset()
            }}
          >
            cancel
          </ButtonSecondary>
          <ButtonPrimary
            size="small"
            onClick={onCreate}
            loading={isLoading}
            disabled={isDisabled}
          >
            add
          </ButtonPrimary>
        </div>
      )}
    </div>
  )
}

function useGallery(uploads: Upload[]) {
  const [showGalleryImage, setGalleryImage] = React.useState<{
    id: string
  } | null>(null)
  const image = uploads.find((x) => x.id === showGalleryImage?.id)
  const imagePosition = uploads.findIndex((x) => x.id === showGalleryImage?.id)

  useGlobalEvent({
    keyDown: (e) => {
      if (e.key === "Escape") {
        setGalleryImage(null)
      }
      if (e.key === "ArrowLeft") {
        setGalleryImage({ id: uploads[imagePosition - 1].id })
      }
      if (e.key === "ArrowRight") {
        setGalleryImage({ id: uploads[imagePosition + 1].id })
      }
    },
  })

  const openImage = React.useCallback((imageId: string) => {
    setGalleryImage({ id: imageId })
  }, [])

  const hasPrevious = imagePosition > 0
  const hasNext = imagePosition < uploads.length - 1

  const onPrevious = React.useCallback(() => {
    setGalleryImage({ id: uploads[imagePosition - 1].id })
  }, [imagePosition, uploads])
  const onNext = React.useCallback(() => {
    setGalleryImage({ id: uploads[imagePosition + 1].id })
  }, [imagePosition, uploads])
  const onClose = React.useCallback(() => {
    setGalleryImage(null)
  }, [])
  return {
    openImage,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
    onClose,
    url: image?.url,
  }
}

function isNote(x: TimelineItem): x is INote {
  return x.type === "note"
}

interface INoteContainerProps {
  readonly recipeId: IRecipe["id"]
  readonly timelineItems: IRecipe["timelineItems"]
}
export function NoteContainer(props: INoteContainerProps) {
  const notes: INote[] = props.timelineItems.filter(isNote)
  const attachments = flatten(notes.map((x) => x.attachments))
  const { openImage, hasNext, hasPrevious, onClose, onNext, onPrevious, url } =
    useGallery(attachments)

  return (
    <>
      <hr />
      {url != null && (
        <Gallery
          imageUrl={url}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={onPrevious}
          onNext={onNext}
          onClose={onClose}
        />
      )}
      <NoteCreator recipeId={props.recipeId} className="pb-4 no-print" />
      {orderBy(props.timelineItems, "created", "desc").map((timelineItem) => {
        switch (timelineItem.type) {
          case "note": {
            return (
              <Note
                key={"recipe-note" + String(timelineItem.id)}
                note={timelineItem}
                openImage={openImage}
                recipeId={props.recipeId}
                className="pb-2"
              />
            )
          }
          case "recipe":
            return (
              <TimelineEvent
                key={"recipe-recipe" + String(timelineItem.id)}
                event={timelineItem}
                className="mb-4 py-4"
              />
            )
        }
      })}
    </>
  )
}
