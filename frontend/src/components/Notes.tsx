import React, { useState, useEffect } from "react"
import { distanceInWordsToNow } from "date-fns"
import { Avatar } from "@/components/Avatar"
import {
  IRecipe,
  addNoteToRecipe,
  toggleCreatingNewNote,
  setDraftNote,
  updateNote,
  toggleEditingNoteById
} from "@/store/reducers/recipes"
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons"
import { classNames } from "@/classnames"
import { useDispatch, useSelector } from "@/hooks"
import { isSuccessLike } from "@/webdata"
import orderBy from "lodash/orderBy"
import Textarea from "react-textarea-autosize"

interface INoteProps {
  readonly note: IRecipe["notes"][0]
  readonly recipeId: IRecipe["id"]
  readonly className?: string
}
export function Note({ recipeId, note, className }: INoteProps) {
  const dispatch = useDispatch()
  const [newText, setNewText] = useState(note.text)
  useEffect(() => {
    setNewText(note.text)
  }, [note])
  const created_by = note.created_by
  const textareaId = `edit_note_id:${note.id}`
  const isOpen = useSelector(s => {
    const noteData = s.recipes.notesById[note.id]
    if (!noteData) {
      return false
    }
    return Boolean(noteData.openForEditing)
  })
  const updating = useSelector(s => {
    const noteData = s.recipes.notesById[note.id]
    if (!noteData) {
      return false
    }
    return Boolean(noteData.saving)
  })

  const onCreate = () => {
    dispatch(updateNote.request({ recipeId, noteId: note.id, text: newText }))
  }
  const setEditing = (value: boolean) => {
    dispatch(toggleEditingNoteById({ noteId: note.id, value }))
  }
  const onClose = () => {
    setEditing(false)
  }
  const onDelete = () => {
    alert("delete")
  }
  return (
    <div className={classNames("d-flex align-items-start", className)}>
      <Avatar avatarURL={created_by.avatar_url} className="mr-2" />
      <div className="w-100">
        <p>
          {created_by.email} |{" "}
          {distanceInWordsToNow(new Date(note.created), { addSuffix: true })}
        </p>
        {!isOpen ? (
          <p
            className="cursor-pointer"
            title="click to edit"
            onClick={e => {
              setEditing(true)
              setTimeout(() => {
                const el = document.getElementById(textareaId)
                if (el) {
                  el.focus()
                }
              }, 100)
            }}>
            {note.text}
          </p>
        ) : (
          <>
            <Textarea
              id={textareaId}
              className="my-textarea mb-2"
              onKeyDown={e => {
                if (e.key === "Escape") {
                  onClose()
                }
                if (e.key === "Enter" && e.metaKey) {
                  onCreate()
                }
              }}
              minRows={5}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Add a note..."
            />
            {isOpen && (
              <div className="d-flex justify-between align-center">
                <div className="d-flex justify-between align-center">
                  <ButtonPrimary
                    size="small"
                    onClick={onCreate}
                    loading={updating}
                    className="mr-2">
                    save
                  </ButtonPrimary>
                  <ButtonSecondary size="small" onClick={onClose}>
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

interface INoteCreatorProps {
  readonly recipeId: number
}
function NoteCreator({ recipeId }: INoteCreatorProps) {
  const dispatch = useDispatch()
  const recipe = useSelector(state => {
    const maybeRecipe = state.recipes.byId[recipeId]
    if (!isSuccessLike(maybeRecipe)) {
      return null
    }
    return maybeRecipe.data
  })
  if (!recipe) {
    return null
  }
  const isOpen = recipe.creatingNewNote
  const note = recipe.draftNote
  const loading = recipe.addingNoteToRecipe

  const onCreate = () => {
    dispatch(addNoteToRecipe.request({ id: recipeId }))
  }
  const onCancel = () => {
    dispatch(toggleCreatingNewNote({ recipeId, value: false }))
  }
  return (
    <div>
      <Textarea
        id="new_note_textarea"
        className={classNames({
          "my-textarea mb-2": isOpen,
          textarea: !isOpen
        })}
        onKeyDown={e => {
          if (e.key === "Escape") {
            dispatch(toggleCreatingNewNote({ recipeId, value: false }))
          }
          if (e.key === "Enter" && e.metaKey) {
            onCreate()
          }
        }}
        minRows={isOpen ? 5 : 0}
        rows={!isOpen ? 1 : undefined}
        value={isOpen ? note : ""}
        onFocus={() =>
          dispatch(toggleCreatingNewNote({ recipeId, value: true }))
        }
        onChange={e =>
          dispatch(setDraftNote({ recipeId, text: e.target.value }))
        }
        placeholder="Add a note..."
      />
      {isOpen && (
        <div className="d-flex justify-between align-center">
          <ButtonPrimary size="small" onClick={onCreate} loading={loading}>
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
        <Note recipeId={props.recipeId} note={note} className="pb-4" />
      ))}
    </>
  )
}
