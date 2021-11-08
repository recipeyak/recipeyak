import React, { useState, useEffect } from "react"
import { Avatar } from "@/components/Avatar"
import {
  IRecipe,
  INote,
  RecipeTimelineItem,
  patchRecipe,
} from "@/store/reducers/recipes"
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons"
import { classNames } from "@/classnames"

import orderBy from "lodash/orderBy"
import Textarea from "react-textarea-autosize"
import { Markdown } from "@/components/Markdown"
import { useLocation } from "react-router-dom"
import { formatAbsoluteDate, formatHumanDate } from "@/date"
import { styled } from "@/theme"
import * as api from "@/api"

import { isOk } from "@/result"
import { useDispatch } from "@/hooks"

interface IUseNoteEditHandlers {
  readonly note: INote
  readonly recipeId: IRecipe["id"]
}
function useNoteEditHandlers({ note, recipeId }: IUseNoteEditHandlers) {
  const dispatch = useDispatch()
  const [draftText, setNewText] = useState(note.text)
  useEffect(() => {
    setNewText(note.text)
  }, [note])
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
  const prettyDate = formatAbsoluteDate(date, { includeYear: true })
  const humanizedDate = formatHumanDate(date)
  return (
    <SmallTime title={prettyDate} dateTime={created} className="text-muted">
      {humanizedDate}
    </SmallTime>
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

  const ref = React.useRef<HTMLDivElement>(null)
  const noteId = `note-${note.id}`
  const location = useLocation()
  const isSharedNote = location.hash === `#${noteId}`

  React.useEffect(() => {
    if (isSharedNote) {
      ref.current?.scrollIntoView()
    }
  }, [isSharedNote])
  return (
    <div
      ref={ref}
      className={classNames(
        "d-flex align-items-start",
        {
          "bg-highlight": isSharedNote,
        },
        className,
      )}
      id={noteId}>
      <Avatar avatarURL={note.created_by.avatar_url} className="mr-2" />
      <div className="w-100">
        <p>
          <b>{note.created_by.email}</b>{" "}
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
                <div className="d-flex justify-between align-center">
                  <ButtonPrimary
                    size="small"
                    onClick={onSave}
                    loading={isUpdating}
                    className="mr-2">
                    save
                  </ButtonPrimary>
                  <ButtonSecondary size="small" onClick={onCancel}>
                    cancel
                  </ButtonSecondary>
                </div>
                <ButtonSecondary size="small" onClick={onDelete}>
                  delete
                </ButtonSecondary>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TimelineEvent({ event }: { readonly event: RecipeTimelineItem }) {
  return (
    <div className={classNames("d-flex align-items-center mb-4 py-4")}>
      <Avatar avatarURL={event.created_by.avatar_url} className="mr-2" />
      <div className="d-flex flex-column">
        <div>
          <b>{event.created_by.email}</b>{" "}
          <span>{event.action} this recipe </span>
        </div>
        <NoteTimeStamp created={event.created} />
      </div>
    </div>
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
  const editorClassNames = classNames({
    "my-textarea mb-2": isEditing,
    textarea: !isEditing,
  })

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
  }
}

interface INoteCreatorProps {
  readonly recipeId: IRecipe["id"]
  readonly className?: string
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
  } = useNoteCreatorHandlers({
    recipeId,
  })
  return (
    <div className={className}>
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
        <div className="d-flex justify-between align-center">
          <ButtonPrimary size="small" onClick={onCreate} loading={isLoading}>
            add
          </ButtonPrimary>
          <ButtonSecondary size="small" onClick={onCancel}>
            cancel
          </ButtonSecondary>
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
                key={"recipe" + timelineItem.id}
                note={timelineItem}
                recipeId={props.recipeId}
                className="pb-2"
              />
            )
          }
          case "recipe":
            return (
              <TimelineEvent
                key={"recipe" + timelineItem.id}
                event={timelineItem}
              />
            )
        }
      })}
    </>
  )
}
