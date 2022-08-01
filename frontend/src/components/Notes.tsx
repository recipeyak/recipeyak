import React, { useState, useEffect } from "react"
import { Avatar } from "@/components/Avatar"
import {
  IRecipe,
  INote,
  RecipeTimelineItem,
  patchRecipe,
} from "@/store/reducers/recipes"
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons"
import { classNames as cls } from "@/classnames"

import orderBy from "lodash/orderBy"
import Textarea from "react-textarea-autosize"
import { Markdown } from "@/components/Markdown"
import { useLocation } from "react-router-dom"
import { formatAbsoluteDateTime, formatHumanDateTime } from "@/date"
import { styled } from "@/theme"
import * as api from "@/api"

import { isOk } from "@/result"
import { useDispatch } from "@/hooks"
import { useDropzone } from "react-dropzone"

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

  const onSave = () => {
    setIsUpdating(true)
    api.updateNote({ noteId: note.id, note: draftText }).then(res => {
      if (isOk(res)) {
        dispatch(
          patchRecipe({
            recipeId,
            updateFn: recipe => {
              return {
                ...recipe,
                timelineItems: [
                  ...recipe.timelineItems.filter(x => x.id !== note.id),
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
      api.deleteNote({ noteId: note.id }).then(res => {
        if (isOk(res)) {
          dispatch(
            patchRecipe({
              recipeId,
              updateFn: recipe => {
                return {
                  ...recipe,
                  timelineItems: recipe.timelineItems.filter(
                    x => x.id !== note.id,
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
      id={id}>
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
  } = useNoteEditHandlers({ note, recipeId })

  const noteId = `note-${note.id}`

  return (
    <SharedEntry
      className={cls("d-flex align-items-start", className)}
      id={noteId}>
      <Avatar avatarURL={note.created_by.avatar_url} className="mr-2" />
      <div className="w-100">
        <p>
          <b>{note.created_by.name}</b>{" "}
          <a href={`#${noteId}`}>
            <NoteTimeStamp created={note.created} />
          </a>
        </p>
        {!isEditing ? (
          <Markdown
            className="cursor-pointer"
            title="click to edit"
            onClick={onNoteClick}>
            {note.text}
          </Markdown>
        ) : (
          <>
            <Textarea
              autoFocus
              className="my-textarea mb-2"
              onKeyDown={onEditorKeyDown}
              minRows={5}
              value={draftText}
              onChange={onEditorChange}
              placeholder="Add a note..."
            />
            {isEditing && (
              <div className="d-flex justify-between align-center">
                <ButtonSecondary
                  size="small"
                  onClick={onDelete}
                  className="mr-2">
                  delete
                </ButtonSecondary>
                <div className="d-flex justify-between align-center">
                  <ButtonSecondary
                    size="small"
                    onClick={onCancel}
                    className="mr-3">
                    cancel
                  </ButtonSecondary>
                  <ButtonPrimary
                    size="small"
                    onClick={onSave}
                    loading={isUpdating}>
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
      className={cls("d-flex align-items-center mb-4 py-4")}>
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

  const cancelEditingNote = () => {
    setIsEditing(false)
    setDraftText("")
    blurNoteTextArea()
  }

  const onCreate = () => {
    setIsLoading(true)
    api.addNoteToRecipe({ recipeId, note: draftText }).then(res => {
      if (isOk(res)) {
        dispatch(
          patchRecipe({
            recipeId,
            updateFn: recipe => {
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
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  padding-top: 0.1rem;
  padding-bottom: 0.1rem;
`

function NoteCreator({ recipeId, className }: INoteCreatorProps) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone()
  const examples = [
    {
      path:
        "Fisherman's Cottage on the Cliffs at Varengeville — Cloude Monet (1882) copy.jpg",
    },
  ]
  const files = examples.map(file => <span key={file.path}>{file.path}</span>)

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
  } = useNoteCreatorHandlers({
    recipeId,
  })

  return (
    <div className={className}>
      <NoteWrapper {...getRootProps({ className: "dropzone" })}>
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
          <>
            <ImageUploadContainer>{files}</ImageUploadContainer>
            <DragDropLabel className="text-muted mb-2">
              <input type="file" style={{ display: "none" }} />
              Attach files by dragging & dropping, selecting or pasting them.
            </DragDropLabel>
          </>
        )}
      </NoteWrapper>

      {isEditing && (
        <div className="d-flex justify-end align-center">
          <ButtonSecondary size="small" className="mr-3" onClick={onCancel}>
            cancel
          </ButtonSecondary>
          <ButtonPrimary
            size="small"
            onClick={onCreate}
            loading={isLoading}
            disabled={isDisabled}>
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
      {orderBy(props.timelineItems, "created", "desc").map(timelineItem => {
        switch (timelineItem.type) {
          case "note": {
            return (
              <Note
                key={"recipe" + String(timelineItem.id)}
                note={timelineItem}
                recipeId={props.recipeId}
                className="pb-2"
              />
            )
          }
          case "recipe":
            return (
              <TimelineEvent
                key={"recipe" + String(timelineItem.id)}
                event={timelineItem}
              />
            )
        }
      })}
    </>
  )
}
