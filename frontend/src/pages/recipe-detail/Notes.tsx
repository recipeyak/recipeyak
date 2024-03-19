import orderBy from "lodash-es/orderBy"
import React, { useEffect, useState } from "react"
import { DialogTrigger } from "react-aria-components"
import { Link, useLocation } from "react-router-dom"

import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Markdown } from "@/components/Markdown"
import { Modal } from "@/components/Modal"
import { Textarea } from "@/components/Textarea"
import { FilePreview } from "@/pages/recipe-detail/FilePreview"
import { FileUploader } from "@/pages/recipe-detail/FileUploader"
import { NoteCreateForm } from "@/pages/recipe-detail/NoteCreateForm"
import { NoteTimeStamp } from "@/pages/recipe-detail/NoteTimestamp"
import {
  ReactionPopover,
  ReactionsFooter,
} from "@/pages/recipe-detail/Reactions"
import { findReaction } from "@/pages/recipe-detail/reactionUtils"
import { SectionTitle } from "@/pages/recipe-detail/RecipeHelpers"
import { UploadContainer } from "@/pages/recipe-detail/UploadContainer"
import { useFileUpload } from "@/pages/recipe-detail/useFileUpload"
import { pathProfileById } from "@/paths"
import { useNoteDelete } from "@/queries/useNoteDelete"
import { useNoteUpdate } from "@/queries/useNoteUpdate"
import { PickVariant } from "@/queries/useQueryUtilTypes"
import { useReactionCreate } from "@/queries/useReactionCreate"
import { useReactionDelete } from "@/queries/useReactionDelete"
import { RecipeFetchResponse as Recipe } from "@/queries/useRecipeFetch"
import { useUserId } from "@/useUserId"

type RecipeTimelineItem = Recipe["timelineItems"][number]

type Note = PickVariant<RecipeTimelineItem, "note">
type Upload = Note["attachments"][number]

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
  const [isEditing, setIsEditing] = useState(false)
  const [uploads, setUploads] = useState<readonly UploadSuccess[]>(
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
                          Delete Note
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
                    Update Note
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

function TimelineEvent({
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
    <SharedEntry id={eventId} className={clx("flex gap-2", className)}>
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

export type UploadSuccess = Upload & { localId?: string }

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
      <NoteCreateForm recipeId={props.recipeId} className="pb-4 print:hidden" />
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
