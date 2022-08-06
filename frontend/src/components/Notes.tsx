import { omit, orderBy } from "lodash"
import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import Textarea from "react-textarea-autosize"

import * as api from "@/api"
import { classNames as cls } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons"
import Loader from "@/components/Loader"
import { Markdown } from "@/components/Markdown"
import { formatAbsoluteDateTime, formatHumanDateTime } from "@/date"
import { useDispatch } from "@/hooks"
import { isOk } from "@/result"
import {
  INote,
  IRecipe,
  patchRecipe,
  RecipeTimelineItem,
  Upload,
} from "@/store/reducers/recipes"
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
  const [uploads, setUploads] = React.useState<Upload[]>(note.attachments)

  const onSave = () => {
    setIsUpdating(true)
    void api
      .updateNote({
        noteId: note.id,
        note: draftText,
        attachmentUploadIds: uploads.map((x) => x.id),
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
  const onNoteClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Opening edit when a user clicks links results in weird looking UI as edit
    // opens right as they are navigating away navigation.
    if (e.target instanceof Element && e.target.tagName === "A") {
      return
    }
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
    uploads,
    addUploads: (uploadIds: Upload[]) => {
      setUploads((s) => [...s, ...uploadIds])
    },
    removeUploads: (uploadIds: string[]) => {
      setUploads((s) => s.filter((x) => !uploadIds.includes(x.id)))
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

interface INoteProps {
  readonly note: INote
  readonly recipeId: IRecipe["id"]
  readonly className?: string
}
export function Note({ note, recipeId, className }: INoteProps) {
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
    uploads,
  } = useNoteEditHandlers({ note, recipeId })

  const noteId = `note-${note.id}`

  const { addFiles, removeFile, files } = useImageUpload(
    addUploads,
    removeUploads,
  )

  return (
    <SharedEntry
      className={cls("d-flex align-items-start", className)}
      id={noteId}
    >
      <Avatar avatarURL={note.created_by.avatar_url} className="mr-2" />
      <div className="w-100">
        <p>
          <b>{note.created_by.name}</b>{" "}
          <a href={`#${noteId}`}>
            <NoteTimeStamp created={note.created} />
          </a>
        </p>
        {!isEditing ? (
          <div className="cursor-pointer" onClick={onNoteClick}>
            <Markdown className="cursor-pointer" title="click to edit">
              {note.text}
            </Markdown>
            <div>
              {note.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  target="_blank"
                  rel="noreferrer"
                  href={attachment.url}
                >
                  <ImagePreview src={attachment.url} />
                </a>
              ))}
            </div>
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
                  files={[...files.filter(notUndefined), ...uploads]}
                />
              ) : (
                <div>
                  {note.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      target="_blank"
                      rel="noreferrer"
                      href={attachment.url}
                    >
                      <ImagePreview src={attachment.url} />
                    </a>
                  ))}
                </div>
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
                    onClick={onCancel}
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

function TimelineEvent({ event }: { readonly event: RecipeTimelineItem }) {
  const eventId = `event-${event.id}`
  return (
    <SharedEntry
      id={eventId}
      className={cls("d-flex align-items-center mb-4 py-4")}
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
        <a href={`#${eventId}`}>
          <NoteTimeStamp created={event.created} />
        </a>
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
  const [uploads, setUploads] = React.useState<Upload[]>([])

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
        attachmentUploadIds: uploads.map((x) => x.id),
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

  const isDisabled = draftText === ""

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
    addUploads: (uploadIds: Upload[]) => {
      setUploads((s) => [...s, ...uploadIds])
    },
    removeUploads: (uploadIds: string[]) => {
      setUploads((s) => s.filter((x) => !uploadIds.includes(x.id)))
    },
    uploads,
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
`

const ImagePreviewParent = styled.div`
  position: relative;
`
const CloseButton = styled.button`
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

const ImagePreview = styled.img<{
  readonly isLoading?: boolean
}>`
  max-height: 100px;
  max-width: 100px;
  border-radius: 3px;
  margin-right: 0.25rem;
  filter: ${(props) => (props.isLoading ? "grayscale(100%)" : "unset")};
`

const OverlayLoader = styled(Loader)`
  margin: auto;
`

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

function useImageUpload(
  addUploads: (uploadIds: Upload[]) => void,
  removeUploads: (uploadIds: string[]) => void,
) {
  const [inProgressUploads, setInprogressUploads] = React.useState<{
    [_: string]: InProgressUpload | undefined
  }>({})

  const addFiles = (files: FileList) => {
    ;[...files].forEach((file) => {
      const fileId = uuid4()
      setInprogressUploads((s) => {
        return {
          ...s,
          [fileId]: {
            id: fileId,
            file,
            state: "uploading",
            type: "in-progress",
          },
        }
      })
      void api.uploadImage({ image: file }).then((res) => {
        if (isOk(res)) {
          addUploads([{ ...res.data, type: "upload" }])
          setInprogressUploads((s) => {
            return omit(s, fileId)
          })
        }
      })
    })
  }

  const removeFile = (fileId: string) => {
    setInprogressUploads((s) => omit(s, fileId))
    removeUploads([fileId])
  }

  const files = Object.values(inProgressUploads)
  return { addFiles, removeFile, files } as const
}

function Image({
  url,
  state,
}: {
  url: string
  state: "loading" | "failed" | "uploaded"
}) {
  return (
    <>
      <a href={url} target="_blank" rel="noreferrer">
        <ImagePreview isLoading={state === "loading"} src={url} />
      </a>
      {state === "failed" && (
        <BrokenImageContainer title="Image upload failed">
          <BrokenImage>❌</BrokenImage>
        </BrokenImageContainer>
      )}
      {state === "loading" && (
        <LoaderContainer title="Image uploading...">
          <OverlayLoader />
        </LoaderContainer>
      )}
    </>
  )
}

type InProgressUpload = {
  type: "in-progress"
  id: string
  file: File
  state: "uploading" | "failed"
}

function ImageUploader({
  addFiles,
  removeFile,
  files,
}: {
  addFiles: (files: FileList) => void
  removeFile: (fileId: string) => void
  files: (InProgressUpload | Upload)[]
}) {
  return (
    <>
      {files.length > 0 && (
        <ImageUploadContainer>
          {orderBy(files, (x) => x.id, "desc").map((f) => (
            <ImagePreviewParent key={f.id}>
              {f.type === "upload" ? (
                <Image url={f.url} state={"uploaded"} />
              ) : (
                <Image
                  url={URL.createObjectURL(f.file)}
                  state={f.state === "failed" ? "failed" : "loading"}
                />
              )}

              <CloseButton
                onClick={() => {
                  if (confirm("Remove image?")) {
                    removeFile(f.id)
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
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const newFiles = e.target.files
            if (newFiles != null) {
              addFiles(newFiles)
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
    uploads,
  } = useNoteCreatorHandlers({
    recipeId,
  })

  const { addFiles, removeFile, files } = useImageUpload(
    addUploads,
    removeUploads,
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
            files={[...files.filter(notUndefined), ...uploads]}
          />
        )}
      </UploadContainer>

      {isEditing && (
        <div className="d-flex justify-end align-center">
          <ButtonSecondary size="small" className="mr-3" onClick={onCancel}>
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

interface INoteContainerProps {
  readonly recipeId: IRecipe["id"]
  readonly timelineItems: IRecipe["timelineItems"]
}
export function NoteContainer(props: INoteContainerProps) {
  return (
    <>
      <hr />
      <NoteCreator recipeId={props.recipeId} className="pb-4" />
      {orderBy(props.timelineItems, "created", "desc").map((timelineItem) => {
        switch (timelineItem.type) {
          case "note": {
            return (
              <Note
                key={"recipe-note" + String(timelineItem.id)}
                note={timelineItem}
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
              />
            )
        }
      })}
    </>
  )
}
