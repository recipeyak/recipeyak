import React from "react"
import { distanceInWordsToNow } from "date-fns"
import { Avatar } from "@/components/Avatar"
import {
  IRecipe,
  addNoteToRecipe,
  toggleEditingNote,
  setDraftNote
} from "@/store/reducers/recipes"
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons"
import { classNames } from "@/classnames"
import { useDispatch, useSelector } from "@/hooks"
import { isSuccessLike } from "@/webdata"
import orderBy from "lodash/orderBy"
import Textarea from "react-textarea-autosize"

interface INoteProps {
  readonly note: IRecipe["notes"][0]
  readonly className?: string
}
export function Note({ note, className }: INoteProps) {
  const created_by = note.created_by
  return (
    <div className={classNames("d-flex align-items-start", className)}>
      <Avatar avatarURL={created_by.avatar_url} className="mr-2" />
      <div>
        <p>
          {created_by.email} |{" "}
          {distanceInWordsToNow(new Date(note.created), { addSuffix: true })}
        </p>

        <p>{note.text}</p>
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
  const isOpen = recipe.editingNote
  const note = recipe.draftNote
  const loading = recipe.addingNoteToRecipe

  const onCreate = () => {
    dispatch(addNoteToRecipe.request({ id: recipeId }))
  }
  const onCancel = () => {
    dispatch(toggleEditingNote({ recipeId, value: false }))
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
            dispatch(toggleEditingNote({ recipeId, value: false }))
          }
          if (e.key === "Enter" && e.metaKey) {
            onCreate()
          }
        }}
        minRows={isOpen ? 5 : 0}
        rows={!isOpen ? 1 : undefined}
        value={isOpen ? note : ""}
        onFocus={() => dispatch(toggleEditingNote({ recipeId, value: true }))}
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
        <Note note={note} className="pb-4" />
      ))}
    </>
  )
}
