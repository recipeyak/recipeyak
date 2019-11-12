import React from "react"
import { distanceInWordsToNow } from "date-fns"
import { Avatar } from "@/components/Avatar"
import { IRecipe } from "@/store/reducers/recipes"

interface INoteProps {
  readonly note: IRecipe["notes"][0]
}
export function Note({ note }: INoteProps) {
  const created_by = note.created_by
  return (
    <div className="d-flex align-items-start">
      <Avatar avatarURL={created_by.avatar_url} />
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

interface INoteContainerProps {
  readonly recipeId: IRecipe["id"]
  readonly notes: IRecipe["notes"]
}
export function NoteContainer(props: INoteContainerProps) {
  return (
    <>
      {props.notes.map(note => (
        <Note note={note} />
      ))}
    </>
  )
}
