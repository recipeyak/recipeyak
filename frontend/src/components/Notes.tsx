import React from "react"
import { distanceInWordsToNow } from "date-fns"
import { Avatar } from "@/components/Avatar"
import { IRecipe } from "@/store/reducers/recipes"
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons"

interface INoteProps {
  readonly note: IRecipe["notes"][0]
}
export function Note({ note }: INoteProps) {
  const created_by = note.created_by
  return (
    <div className="d-flex align-items-start">
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

function NoteCreator() {
  return (
    <div>
      <textarea
        className="my-textarea mb-2"
        cols={30}
        rows={10}
        placeholder="Add a note..."
      />
      <div className="d-flex justify-between align-center">
        <ButtonPrimary size="small">add</ButtonPrimary>
        <ButtonSecondary size="small">cancel</ButtonSecondary>
      </div>
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
      <NoteCreator />
      <hr />
      {props.notes.map(note => (
        <Note note={note} />
      ))}
    </>
  )
}
