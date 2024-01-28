import produce from "immer"
import orderBy from "lodash-es/orderBy"
import React, { useEffect, useRef, useState } from "react"
import { DialogTrigger } from "react-aria-components"
import { Link, useLocation } from "react-router-dom"

import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Markdown } from "@/components/Markdown"
import { Modal } from "@/components/Modal"
import { RotatingLoader } from "@/components/RoatingLoader"
import { Textarea } from "@/components/Textarea"
import { formatAbsoluteDateTime, formatHumanDateTime } from "@/date"
import {
  ReactionPopover,
  ReactionsFooter,
} from "@/pages/recipe-detail/Reactions"
import { findReaction } from "@/pages/recipe-detail/reactionUtils"
import { SectionTitle } from "@/pages/recipe-detail/RecipeHelpers"
import { pathProfileById } from "@/paths"
import { useNoteCreate } from "@/queries/noteCreate"
import { useNoteDelete } from "@/queries/noteDelete"
import { useNoteUpdate } from "@/queries/noteUpdate"
import { PickVariant } from "@/queries/queryUtilTypes"
import { useReactionCreate } from "@/queries/reactionCreate"
import { useReactionDelete } from "@/queries/reactionDelete"
import { RecipeFetchResponse as Recipe } from "@/queries/recipeFetch"
import { useUploadCreate } from "@/queries/uploadCreate"
import { toast } from "@/toast"
import { notUndefined } from "@/typeguard"
import { imgixFmt } from "@/url"
import { useUserId } from "@/useUserId"
import { uuid4 } from "@/uuid"

type RecipeTimelineItem = Recipe["timelineItems"][number]

type Note = PickVariant<RecipeTimelineItem, "note">
type Upload = Note["attachments"][number]

export function NoteTimeStamp({ created }: { readonly created: string }) {
  const date = new Date(created)
  const prettyDate = formatAbsoluteDateTime(date, { includeYear: true })
  const humanizedDate = formatHumanDateTime(date)
  return (
    <time
      title={prettyDate}
      dateTime={created}
      className="text-[0.85rem] text-[--color-text-muted] print:text-black"
    >
      {humanizedDate}
    </time>
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
      className={clx(isSharedNote && "animate-highlighted-fade", className)}
      id={id}
    >
      {children}
    </div>
  )
}

function Attachments({
  attachments,
  openImage,
}: {
  attachments: Note["attachments"]
  openImage: (_: string) => void
}) {
  if (attachments.length === 0) {
    return null
  }
  return (
    <Box wrap gap={1}>
      {attachments.map((attachment) => (
        <FilePreview
          key={attachment.id}
          onClick={() => {
            openImage(attachment.id)
          }}
          contentType={attachment.contentType}
          src={attachment.url}
          backgroundUrl={attachment.backgroundUrl}
        />
      ))}
    </Box>
  )
}

interface INoteProps {
  readonly note: Note
  readonly recipeId: number
  readonly className?: string
  readonly readonly?: boolean
  readonly openImage: (id: string) => void
}
export function Note({
  note,
  recipeId,
  className,
  openImage,
  readonly,
}: INoteProps) {
  const [draftText, setNewText] = useState(note.text)
  useEffect(() => {
    setNewText(note.text)
  }, [note.text])
  const [isEditing, setIsEditing] = React.useState(false)
  const [uploads, setUploads] = React.useState<readonly UploadSuccess[]>(
    note.attachments.map((x) => ({ ...x, localId: x.id })),
  )
  const deleteNote = useNoteDelete()
  const updateNote = useNoteUpdate()

  const addUploads = (upload: UploadSuccess) => {
    setUploads((s) => [upload, ...s])
  }
  const removeUploads = (localIds: string[]) => {
    setUploads((s) => {
      return s.filter((u) => u.localId == null || !localIds.includes(u.localId))
    })
  }
  const resetUploads = () => {
    setUploads([])
  }

  const userId = useUserId()

  const noteHtmlId = `note-${note.id}`

  const { addFiles, removeFile, files, hasUnsavedImages, reset } =
    useFileUpload(addUploads, removeUploads, uploads, resetUploads, recipeId)

  const createReaction = useReactionCreate()
  const deleteReaction = useReactionDelete()

  return (
    <SharedEntry
      className={clx("flex items-start gap-2", className)}
      id={noteHtmlId}
    >
      <Avatar avatarURL={note.created_by.avatar_url} />
      <div className="w-full">
        <Box align="center">
          <Link
            className="font-bold"
            to={pathProfileById({ userId: note.created_by.id.toString() })}
          >
            {note.created_by.name}
          </Link>{" "}
          <a href={`#${noteHtmlId}`} className="ml-2">
            <NoteTimeStamp created={note.created} />
          </a>
          {!readonly && (
            <>
              <ReactionPopover
                className="ml-auto print:!hidden"
                onPick={(emoji) => {
                  const existingReaction = findReaction(
                    note.reactions,
                    emoji,
                    userId ?? 0,
                  )
                  if (existingReaction != null) {
                    // remove reaction
                    deleteReaction.mutate({
                      recipeId,
                      noteId: note.id,
                      reactionId: existingReaction.id,
                    })
                  } else {
                    createReaction.mutate({
                      recipeId,
                      noteId: note.id,
                      type: emoji,
                    })
                  }
                }}
                reactions={note.reactions}
              />
              {note.created_by.id === userId ? (
                <a
                  className="ml-2 cursor-pointer text-[0.825rem] text-[--color-text-muted] print:hidden"
                  data-testid="edit-note"
                  onClick={() => {
                    setIsEditing(true)
                  }}
                >
                  edit
                </a>
              ) : null}
            </>
          )}
        </Box>
        {!isEditing ? (
          <Box dir="col" className="gap-1">
            <Markdown>{note.text}</Markdown>
            {(note.attachments.length > 0 ||
              note.reactions.length > 0 ||
              !readonly) && (
              <Box gap={1} dir="col">
                <Attachments
                  attachments={note.attachments}
                  openImage={openImage}
                />
                <ReactionsFooter
                  readonly={readonly}
                  userId={userId}
                  reactions={note.reactions}
                  onPick={(emoji) => {
                    const existingReaction = findReaction(
                      note.reactions,
                      emoji,
                      userId ?? 0,
                    )
                    if (existingReaction != null) {
                      // remove reaction
                      deleteReaction.mutate({
                        recipeId,
                        noteId: note.id,
                        reactionId: existingReaction.id,
                      })
                    } else {
                      createReaction.mutate({
                        recipeId,
                        noteId: note.id,
                        type: emoji,
                      })
                    }
                  }}
                  onClick={(emoji) => {
                    const existingReaction = findReaction(
                      note.reactions,
                      emoji,
                      userId ?? 0,
                    )
                    if (existingReaction != null) {
                      // remove reaction
                      deleteReaction.mutate({
                        recipeId,
                        noteId: note.id,
                        reactionId: existingReaction.id,
                      })
                    } else {
                      createReaction.mutate({
                        recipeId,
                        noteId: note.id,
                        type: emoji,
                      })
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        ) : (
          <>
            <UploadContainer addFiles={addFiles}>
              <Textarea
                autoFocus
                bottomFlat
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Escape") {
                    setIsEditing(false)
                  }
                  if (e.key === "Enter" && e.metaKey) {
                    updateNote.mutate(
                      {
                        recipeId,
                        noteId: note.id,
                        note: draftText,
                        attachmentUploadIds: uploads.map((x) => x.id),
                      },
                      {
                        onSuccess: () => {
                          setIsEditing(false)
                        },
                      },
                    )
                  }
                }}
                minRows={5}
                value={draftText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setNewText(e.target.value)
                }}
                placeholder="Add a note..."
              />
              {isEditing ? (
                <FileUploader
                  addFiles={addFiles}
                  removeFile={removeFile}
                  files={files}
                />
              ) : (
                <Box wrap gap={1}>
                  {note.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      target="_blank"
                      rel="noreferrer"
                      href={attachment.url}
                    >
                      <FilePreview
                        contentType={attachment.contentType}
                        src={attachment.url}
                        backgroundUrl={attachment.backgroundUrl}
                      />
                    </a>
                  ))}
                </Box>
              )}
            </UploadContainer>

            {isEditing && (
              <Box space="between" align="center">
                <DialogTrigger>
                  <Button
                    variant="danger"
                    size="small"
                    aria-label="delete note"
                  >
                    Delete
                  </Button>
                  <Modal title="Delete Note">
                    <div className="flex flex-col gap-2">
                      <div>Are you sure you want to delete this note?</div>
                      <div className="flex gap-2">
                        <Button>Cancel</Button>
                        <Button
                          variant="danger"
                          loading={deleteNote.isPending}
                          onClick={() => {
                            deleteNote.mutate({
                              recipeId,
                              noteId: note.id,
                            })
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Modal>
                </DialogTrigger>
                <Box gap={3} space="between" align="center">
                  <Button
                    size="small"
                    onClick={() => {
                      setIsEditing(false)
                      reset()
                    }}
                    aria-label="cancel note"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    aria-label="save note"
                    onClick={() => {
                      updateNote.mutate(
                        {
                          recipeId,
                          noteId: note.id,
                          note: draftText,
                          attachmentUploadIds: uploads.map((x) => x.id),
                        },
                        {
                          onSuccess: () => {
                            setIsEditing(false)
                          },
                        },
                      )
                    }}
                    loading={updateNote.isPending}
                    disabled={hasUnsavedImages}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </div>
    </SharedEntry>
  )
}

function MaybeLink({
  to,
  children,
}: {
  to: string | null
  children: React.ReactNode
}) {
  if (to == null) {
    // eslint-disable-next-line react/forbid-elements
    return <b>{children}</b>
  }
  return (
    <Link to={to} className="font-bold">
      {children}
    </Link>
  )
}

export function TimelineEvent({
  event,
  enableLinking = true,
  className,
}: {
  readonly event: Pick<
    PickVariant<RecipeTimelineItem, "recipe">,
    "created" | "action" | "is_scraped"
  > & {
    id: string | number
    created_by: {
      id: string | number
      name: string
      avatar_url: string
    } | null
  }
  readonly enableLinking?: boolean
  readonly className?: string
}) {
  const eventId = `event-${event.id}`
  const timestamp = <NoteTimeStamp created={event.created} />
  const action =
    event.action === "created" && event.is_scraped ? "imported" : event.action
  return (
    <SharedEntry
      id={eventId}
      className={clx("flex items-center gap-2", className)}
    >
      <Avatar avatarURL={event.created_by?.avatar_url ?? null} />
      <div className="flex flex-col">
        <div>
          <MaybeLink
            to={
              event.created_by?.id
                ? pathProfileById({ userId: event.created_by?.id.toString() })
                : null
            }
          >
            {event.created_by?.name ?? "User"}
          </MaybeLink>{" "}
          <span>{action} this recipe </span>
        </div>
        {enableLinking ? <a href={`#${eventId}`}>{timestamp}</a> : timestamp}
      </div>
    </SharedEntry>
  )
}

const blurNoteTextArea = () => {
  const el = document.getElementById("new_note_textarea")
  if (el) {
    el.blur()
  }
}

interface IUseNoteCreatorHandlers {
  readonly recipeId: number
}

// TODO: inline this function instead of having a hook
function useNoteCreatorHandlers({ recipeId }: IUseNoteCreatorHandlers) {
  const [draftText, setDraftText] = React.useState("")
  const [isEditing, setIsEditing] = React.useState(false)
  const [uploadedImages, setUploads] = React.useState<UploadSuccess[]>([])

  const cancelEditingNote = () => {
    setIsEditing(false)
    setDraftText("")
    setUploads([])
    blurNoteTextArea()
  }

  const createNote = useNoteCreate()

  const onCreate = async () => {
    try {
      await createNote.mutateAsync({
        recipeId,
        note: draftText,
        uploadIds: uploadedImages.map((x) => x.id),
      })
      cancelEditingNote()
    } catch (e) {
      toast.error("Problem adding note to recipe")
    }
  }
  const onCancel = () => {
    cancelEditingNote()
  }
  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      cancelEditingNote()
    }
    if (e.key === "Enter" && e.metaKey) {
      void onCreate()
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

  const isDisabled = editorText === "" && uploadedImages.length === 0

  return {
    isEditing,
    onEditorKeyDown,
    onEditorChange,
    editorMinRowCount,
    editorRowCount,
    editorText,
    onEditorFocus,
    onCreate,
    isLoading: createNote.isPending,
    onCancel,
    isDisabled,
    addUploads: (upload: UploadSuccess) => {
      setUploads((s) => [upload, ...s])
    },
    removeUploads: (localIds: string[]) => {
      setUploads((s) => {
        return s.filter(
          (u) => u.localId == null || !localIds.includes(u.localId),
        )
      })
    },
    uploadedImages,
    resetUploads: () => {
      setUploads([])
    },
  }
}

interface INoteCreatorProps {
  readonly recipeId: number
  readonly className?: string
}

function FilePreview({
  src,
  isLoading,
  backgroundUrl,
  contentType,
  onClick,
}: {
  src: string
  contentType: string
  isLoading?: boolean
  backgroundUrl: string | null
  onClick?: () => void
}) {
  return (
    <div
      className="grid rounded-md bg-[--color-background-empty-image] print:!hidden"
      onClick={onClick}
    >
      <img
        className={clx(
          "z-10 h-[100px] w-[100px] rounded-md object-cover [grid-area:1/1]",
          isLoading && "grayscale",
        )}
        loading="lazy"
        src={contentType.startsWith("image/") ? imgixFmt(src) : src}
      />
      {backgroundUrl != null && (
        <div
          // eslint-disable-next-line no-restricted-syntax
          style={{
            // TODO: could use a css var
            backgroundImage: `url(${backgroundUrl})`,
          }}
          className="relative h-[100px] w-[100px] rounded-md bg-cover bg-center bg-no-repeat object-cover [grid-area:1/1] after:pointer-events-none after:absolute after:h-full after:w-full after:rounded-md after:backdrop-blur-[6px] after:content-['']"
        />
      )}
    </div>
  )
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
function useFileUpload(
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

type InProgressUpload = {
  readonly type: "in-progress"
  readonly url: string
  readonly file: File
  readonly localId: string
  readonly contentType: string
  readonly progress: number
  readonly state: FileUpload["state"]
}

type UploadSuccess = Upload & { localId?: string }

type FileUpload = {
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
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </DialogTrigger>
  )
}

function FileUploader({
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
      <label className="mb-2 cursor-pointer rounded-b-[3px] border-[thin] border-solid border-[--color-border] bg-[--color-background-card] px-[0.25rem] py-[0.1rem] text-sm font-medium text-[--color-text-muted] [border-top-style:none]">
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
        Attach images & pdfs by dragging & dropping, selecting or pasting them.
      </label>
    </>
  )
}

function UploadContainer({
  addFiles,
  children,
}: {
  children: React.ReactNode
  addFiles: (files: FileList) => Promise<void>
}) {
  return (
    <div
      className="flex flex-col"
      onDragOver={(event) => {
        event.dataTransfer.dropEffect = "copy"
      }}
      onDrop={(event) => {
        if (event.dataTransfer?.files) {
          const newFiles = event.dataTransfer.files
          void addFiles(newFiles)
        }
      }}
    >
      {children}
    </div>
  )
}

function NoteCreator({ recipeId, className }: INoteCreatorProps) {
  const {
    isEditing,
    onEditorKeyDown,
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

  const { addFiles, removeFile, files, hasUnsavedImages, reset } =
    useFileUpload(
      addUploads,
      removeUploads,
      uploadedImages,
      resetUploads,
      recipeId,
    )

  return (
    <div className={className}>
      <UploadContainer addFiles={addFiles}>
        <Textarea
          id="new_note_textarea"
          onKeyDown={onEditorKeyDown}
          minRows={editorMinRowCount}
          rows={editorRowCount}
          value={editorText}
          onFocus={onEditorFocus}
          onChange={onEditorChange}
          bottomFlat={isEditing}
          minimized={!isEditing}
          placeholder="Add a note..."
        />
        {isEditing && (
          <FileUploader
            addFiles={addFiles}
            removeFile={removeFile}
            files={files}
          />
        )}
      </UploadContainer>

      {isEditing && (
        <div className="flex items-center justify-end">
          <Button
            size="small"
            className="mr-3"
            onClick={() => {
              onCancel()
              reset()
            }}
          >
            cancel
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              void onCreate().then(() => {
                // ensure we clear out the local state of images
                reset()
              })
            }}
            loading={isLoading}
            disabled={isDisabled || hasUnsavedImages}
          >
            add
          </Button>
        </div>
      )}
    </div>
  )
}

interface INoteContainerProps {
  readonly recipeId: number
  readonly timelineItems: Recipe["timelineItems"]
  readonly openImage: (_: string) => void
}
export function NoteContainer(props: INoteContainerProps) {
  return (
    <>
      <hr className="print:hidden" />
      <SectionTitle className="hidden print:block">Notes</SectionTitle>
      <NoteCreator recipeId={props.recipeId} className="pb-4 print:hidden" />
      {orderBy(props.timelineItems, "created", "desc").map((timelineItem) => {
        switch (timelineItem.type) {
          case "note": {
            return (
              <Note
                key={"recipe-note" + String(timelineItem.id)}
                note={timelineItem}
                openImage={props.openImage}
                recipeId={props.recipeId}
                className="mb-2"
              />
            )
          }
          case "recipe":
            return (
              <TimelineEvent
                key={"recipe-recipe" + String(timelineItem.id)}
                event={timelineItem}
                className="mb-2"
              />
            )
        }
      })}
    </>
  )
}
