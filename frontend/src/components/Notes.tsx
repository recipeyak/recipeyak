import React, { useState, useEffect } from "react"
import { Avatar } from "@/components/Avatar"
import {
  IRecipe,
  addNoteToRecipe,
  toggleCreatingNewNote,
  setDraftNote,
  updateNote,
  toggleEditingNoteById,
  deleteNote,
  INote,
} from "@/store/reducers/recipes"
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons"
import { classNames } from "@/classnames"
import { useDispatch, useSelector } from "@/hooks"
import { isSuccessLike } from "@/webdata"
import orderBy from "lodash/orderBy"
import Textarea from "react-textarea-autosize"
import { Markdown } from "@/components/Markdown"
import { useLocation } from "react-router-dom"
import { formatAbsoluteDate, formatHumanDate } from "@/date"

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
  const isEditing = useSelector(s => {
    const noteData = s.recipes.notesById[note.id]
    if (!noteData) {
      return false
    }
    return Boolean(noteData.openForEditing)
  })
  const isUpdating = useSelector(s => {
    const noteData = s.recipes.notesById[note.id]
    if (!noteData) {
      return false
    }
    return Boolean(noteData.saving)
  })

  const onSave = () => {
    dispatch(updateNote.request({ recipeId, noteId: note.id, text: draftText }))
  }
  const setEditing = (value: boolean) => {
    dispatch(toggleEditingNoteById({ noteId: note.id, value }))
  }
  const onCancel = () => {
    setEditing(false)
  }
  const onDelete = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      dispatch(deleteNote.request({ noteId: note.id, recipeId }))
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

function NoteTimeStamp({ created }: { readonly created: string }) {
  const date = new Date(created)
  const prettyDate = formatAbsoluteDate(date, { includeYear: true })
  const humanizedDate = formatHumanDate(date)
  return (
    <time title={prettyDate} dateTime={date}>
      {humanizedDate}
    </time>
  )
}

interface INoteProps {
  readonly note: INote
  readonly recipeId: IRecipe["id"]
  readonly className?: string
}
export function Note({ recipeId, note, className }: INoteProps) {
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
          {note.created_by.email} |{" "}
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

interface IUseNoteCreatorHandlers {
  readonly recipeId: IRecipe["id"]
}
function useNoteCreatorHandlers({ recipeId }: IUseNoteCreatorHandlers) {
  const dispatch = useDispatch()
  const recipe = useSelector(state => {
    const maybeRecipe = state.recipes.byId[recipeId]
    if (!isSuccessLike(maybeRecipe)) {
      return null
    }
    return maybeRecipe.data
  })

  const onCreate = () => {
    dispatch(addNoteToRecipe.request({ id: recipeId }))
  }
  const onCancel = () => {
    dispatch(toggleCreatingNewNote({ recipeId, value: false }))
  }
  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      dispatch(toggleCreatingNewNote({ recipeId, value: false }))
    }
    if (e.key === "Enter" && e.metaKey) {
      onCreate()
    }
  }
  const onEditorFocus = () => {
    dispatch(toggleCreatingNewNote({ recipeId, value: true }))
  }
  const onEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setDraftNote({ recipeId, text: e.target.value }))
  }

  const isEditing = recipe?.creatingNewNote ?? false
  const isLoading = recipe?.addingNoteToRecipe ?? false
  const editorText = (isEditing && recipe?.draftNote) || ""
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
}
function NoteCreator({ recipeId }: INoteCreatorProps) {
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
    <div>
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
  readonly notes: IRecipe["notes"]
}
export function NoteContainer(props: INoteContainerProps) {
  return (
    <>
      <NoteCreator recipeId={props.recipeId} />
      <hr />
      {orderBy(props.notes, "created", "desc").map(note => (
        <Note
          key={note.id}
          recipeId={props.recipeId}
          note={note}
          className="pb-4"
        />
      ))}
    </>
  )
}
