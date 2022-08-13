import { orderBy } from "lodash"
import React, { useEffect, useState } from "react"
import { Smile } from "react-feather"
import { useLocation } from "react-router-dom"
import Textarea from "react-textarea-autosize"

import * as api from "@/api"
import { classNames as cls } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons"
import { Markdown } from "@/components/Markdown"
import { RotatingLoader } from "@/components/RoatingLoader"
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
import Tippy from "@tippyjs/react"
import slice from "lodash-es/slice"

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
    removeUploads: (uploadIds: string[]) => {
      setUploads((s) => s.filter((x) => !uploadIds.includes(x.id)))
    },
    resetUploads: () => {
      setUploads(note.attachments)
    },
  }
}

const SmallTime = styled.time`
  font-size: 0.85rem;
`

const NoteActionsContainer = styled.div`
  font-size: 0.85rem;
  display: flex;
  align-items: center;
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
`

const ReactionContainer = styled.div`
  display: flex;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
`

const StyledSmile = styled(Smile)`
  color: #7a7a7a;
  &:hover {
    color: #575757;
  }
`

const ReactionButtonContainer = styled.div`
  background-color: white;
  color: #172b4d;

  /* border: 1px solid #ebecf0; */
  border-radius: 12px;
  line-height: 0;
  display: inline-block;
`

const OpenReactions = React.forwardRef(
  (
    props: {
      className?: string
      onClick: () => void
      children?: React.ReactNode
    },

    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <ReactionButtonContainer
        ref={ref}
        className={props.className}
        onClick={props.onClick}
      >
        {props.children ? props.children : <StyledSmile size={14} />}
      </ReactionButtonContainer>
    )
  },
)

const UpvoteReaction = styled.div`
  padding: 0 0.3rem;
  padding-right: 0.5rem;
  border-style: solid;
  background-color: white;
  display: inline-flex;
  /* color: #172b4d; */

  border-radius: 15px;

  border-width: 1px;
  border-color: #d2dff0;
  margin-right: 0.5rem;
  text-align: center;
  &:hover {
    border-color: #575757;
  }
`

const ReactionButton = styled.div`
  padding: 4px;
  height: 32px;
  width: 32px;
  font-size: 16px;
  text-align: center;
  /* border-style: solid; */
  /* border-width: 1px; */
  border-radius: 3px;
  border-color: hsl(0deg, 0%, 86%);
  cursor: pointer;

  &:hover {
    /* border-color: #4a4a4a; */
    background-color: hsla(0, 0%, 0%, 0.06);
  }
`

const REACTION_EMOJIS = ["❤️", "😆", "🤮"] as const

type ReactionType = typeof REACTION_EMOJIS[number]

function reactionTypeToName(x: ReactionType): string {
  return {
    "❤️": "heart",
    "😆": "laughter",
    "🤮": "vomit",
  }[x]
}

type Reaction = {
  id: string
  type: ReactionType
  user: {
    id: string
    name: string
  }
}

type ReactionGroup = {
  type: ReactionType
  reactions: Reaction[]
  firstCreated: string
}[]

const exampleReactionGroup: ReactionGroup = [
  {
    type: "😆",
    firstCreated: new Date().toISOString(),
    reactions: [
      {
        id: uuid4(),
        type: "😆",
        user: {
          id: uuid4(),
          name: "chris",
        },
      },
      {
        id: uuid4(),
        type: "😆",
        user: {
          id: uuid4(),
          name: "steve",
        },
      },
    ],
  },
  {
    type: "❤️",
    firstCreated: new Date().toISOString(),
    reactions: [
      {
        id: uuid4(),
        type: "❤️",
        user: {
          id: uuid4(),
          name: "natasha",
        },
      },
    ],
  },
]

const ReactionCount = styled.div`
  margin-left: 0.2rem;
  height: 24px;
  display: flex;
  align-items: center;
`

function reactionTitle(reactions: Reaction[]): string {
  if (reactions.length === 0) {
    return ""
  }
  if (reactions.length === 1) {
    const reaction = reactions[0]
    return `${reaction.user.name} reacted with ${reactionTypeToName(
      reaction.type,
    )}`
  }
  const initialNames = slice(
    reactions.map((x) => x.user.name),
    reactions.length - 1,
  )
  const lastReaction = reactions[reactions.length - 1]
  return (
    initialNames.join(", ") +
    ", and " +
    lastReaction.user.name +
    ` reacted with ${reactionTypeToName(lastReaction.type)}`
  )
}

const EmojiContainer = styled.div`
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const myUserId = uuid4()

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
    uploadedImages,
    resetUploads,
  } = useNoteEditHandlers({ note, recipeId })

  const noteId = `note-${note.id}`

  const { addFiles, removeFile, files, reset } = useImageUpload(
    addUploads,
    removeUploads,
    uploadedImages,
    resetUploads,
  )

  const [visible, setVisible] = useState(false)

  const [reactions, setReactions] = useState<ReactionGroup>([])

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
          <div>
            <Markdown>{note.text}</Markdown>
            <AttachmentContainer>
              {note.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  target="_blank"
                  rel="noreferrer"
                  href={attachment.url}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <ImagePreview src={attachment.url} />
                </a>
              ))}
            </AttachmentContainer>
            <NoteActionsContainer className="text-muted">
              {orderBy(reactions, (x) => x.firstCreated)
                .filter((reaction) => reaction.reactions.length > 0)
                .map((reaction) => (
                  // <div
                  //   key={reaction.type}
                  //   title={"chris, natasha, and steve reacted"}
                  // >
                  //   {reaction.type}
                  // </div>
                  <UpvoteReaction
                    key={reaction.type}
                    title={reactionTitle(reaction.reactions)}
                    onClick={() => {
                      setReactions((s) => {
                        const existingReactions = s.find(
                          (x) => x.type === reaction.type,
                        )
                        if (existingReactions == null) {
                          return s
                        }
                        if (
                          existingReactions.reactions.find(
                            (x) => x.user.id === myUserId,
                          ) != null
                        ) {
                          existingReactions.reactions =
                            existingReactions.reactions.filter(
                              (x) => x.user.id !== myUserId,
                            )
                        } else {
                          existingReactions.reactions = [
                            ...existingReactions.reactions,
                            {
                              id: uuid4(),
                              type: reaction.type,
                              user: {
                                id: myUserId,
                                name: "chris",
                              },
                            },
                          ]
                        }

                        return [
                          ...s.filter((x) => x.type !== reaction.type),
                          existingReactions,
                        ]
                      })
                    }}
                    className="cursor-pointer text-muted"
                  >
                    <EmojiContainer>{reaction.type}</EmojiContainer>
                    {reaction.reactions.length > 0 && (
                      <ReactionCount>{reaction.reactions.length}</ReactionCount>
                    )}
                  </UpvoteReaction>
                ))}

              {/* <UpvoteReaction className="cursor-pointer text-muted">
                <StyledSmile size={14} />
              </UpvoteReaction> */}

              <Tippy
                visible={visible}
                onClickOutside={() => {
                  setVisible(false)
                }}
                animation={false}
                interactive
                content={
                  <ReactionContainer className="box-shadow-normal">
                    {REACTION_EMOJIS.map((emoji, index) => {
                      return (
                        <ReactionButton
                          key={emoji}
                          onClick={() => {
                            setReactions((s) => {
                              const existingReactions = s.find(
                                (x) => x.type === emoji,
                              )
                              if (existingReactions == null) {
                                return [
                                  ...s,
                                  {
                                    type: emoji,
                                    firstCreated: new Date().toISOString(),
                                    reactions: [
                                      {
                                        id: uuid4(),
                                        type: emoji,
                                        user: {
                                          id: myUserId,
                                          name: "chris",
                                        },
                                      },
                                    ],
                                  },
                                ]
                              }
                              existingReactions.reactions = [
                                ...existingReactions.reactions,
                                {
                                  id: uuid4(),
                                  type: emoji,
                                  user: {
                                    id: myUserId,
                                    name: "chris",
                                  },
                                },
                              ]
                              return [
                                ...s.filter((x) => x.type !== emoji),
                                existingReactions,
                              ]
                            })

                            setVisible(false)
                          }}
                          className={cls({ "ml-1": index > 0 })}
                        >
                          {emoji}
                        </ReactionButton>
                      )
                    })}
                  </ReactionContainer>
                }
              >
                <OpenReactions
                  className="cursor-pointer"
                  onClick={() => {
                    setVisible((s) => !s)
                  }}
                />
              </Tippy>

              {/* </ReactionParent> */}
              <a className="ml-2 text-muted" onClick={onNoteClick}>
                edit
              </a>
            </NoteActionsContainer>
          </div>
        ) : (
          <>
            <UploadContainer addFiles={addFiles}>
              <Textarea
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
    addUploads: (upload: UploadSuccess) => {
      setUploads((s) => [upload, ...s])
    },
    removeUploads: (uploadIds: string[]) => {
      setUploads((s) => s.filter((x) => !uploadIds.includes(x.id)))
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
  margin-right: 0.25rem;
  object-fit: cover;
  filter: ${(props) => (props.isLoading ? "grayscale(100%)" : "unset")};
`
function ImagePreview({
  src,
  isLoading,
}: {
  src: string
  isLoading?: boolean
}) {
  return <Image100Px src={formatUrlImgix100(src)} isLoading={isLoading} />
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
            url: URL.createObjectURL(file),
            state: "loading",
            type: "in-progress",
          } as const,
          ...s,
        ]
      })
      void api.uploadImage({ image: file }).then((res) => {
        if (isOk(res)) {
          addUploads({ ...res.data, type: "upload" })
          setLocalImages((s) => {
            const f = s.find((x) => x.id === fileId)
            if (f) {
              f.dbId = res.data.id
              f.state = "success"
            }
            return s
          })
        } else {
          setLocalImages((s) => {
            const existingUpload = s.find((x) => x.id === fileId)
            if (existingUpload) {
              existingUpload.state = "failed"
            }
            return s
          })
        }
      })
    }
  }

  const removeFile = (fileId: string) => {
    setLocalImages((s) => s.filter((x) => x.id !== fileId))
    removeUploads([fileId])
  }

  const orderedImages: ImageUpload[] = [
    ...localImages,
    ...remoteImages
      .filter(
        (i) =>
          !localImages
            .map((x) => x.dbId)
            .filter(notUndefined)
            .includes(i.id),
      )
      .map((x) => ({ id: x.id, url: x.url, state: "success" } as const)),
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

function ImageWithStatus({
  url,
  state,
}: {
  url: string
  state: ImageUpload["state"]
}) {
  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <ImagePreview isLoading={state === "loading"} src={url} />
      </a>
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
  type: "in-progress"
  id: string
  url: string
  dbId?: string
  file: File
  state: ImageUpload["state"]
}

type UploadSuccess = Upload

type ImageUpload = {
  id: string
  url: string
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
            <ImagePreviewParent key={f.id}>
              <ImageWithStatus url={f.url} state={f.state} />
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
