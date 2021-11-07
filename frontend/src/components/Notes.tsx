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
import { styled } from "@/theme"

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
    <time title={prettyDate} dateTime={dateFormat}>
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
          {note.created_by.email} commented {" "}
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

const TimelineEventContainer = styled.div`

`

const DESCRIPTION_MAP: Record<ITimelineEvent['type'], string> = {
recipe_archived: 'archived',
recipe_created: 'created',
}

function TimelineEvent({event}: {readonly event: {
  actor: Actor, created: string, type: ITimelineEvent['type']}}) {
  const description = DESCRIPTION_MAP[event.type]
  return <TimelineEventContainer

      className={classNames(
        "d-flex align-items-center mb-4 py-4",

      )}
>
      <Avatar avatarURL={event.actor.avatar_url} className="mr-2" />
      <div>{event.actor.email} {description} this <NoteTimeStamp created={event.created} /></div>
    </TimelineEventContainer>
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
    <div className="mb-4">
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

type Actor = {
  id: string
    email: string
    avatar_url: string}

type ITimelineEvent = {
  type: 'note_created'
  id: string
  text: string
  modified: string
  created: string
  last_modified_by: Actor
  created_by: Actor
} | {
  type: 'recipe_created'
  actor: Actor
  created: string
}| {
  type: 'recipe_archived'
  actor: Actor
  created: string
}| {
  type: 'recipe_deleted'
  actor: Actor
  created: string
}| {
  type: 'recipe_scheduled'
  actor: Actor
  created: string
}

interface INoteContainerProps {
  readonly recipeId: IRecipe["id"]
  readonly notes: IRecipe["notes"]
}
export function NoteContainer(props: INoteContainerProps) {
  const notes: ITimelineEvent[] = [{
    type: 'note_created',
  id: '123123',
  text: ` With origins in Japan's yukone (or yudane), tangzhong is a yeast bread technique popularized across Asia by Taiwanese cookbook author Yvonne Chen. Tangzhong involves cooking some of a bread recipe’s flour in liquid prior to adding it to the remaining dough ingredients. Bringing the temperature of the flour and liquid to 65°C (149°F) pre-gelatinizes the flour’s starches, which makes them more able to retain liquid — thus enhancing the resulting bread's softness and shelf life.`,
  modified: "2020",
  created: "2020",
  last_modified_by: {
    id: '12939012390',
    email: 'chris@dignam.xyz',
    avatar_url: 'http://localhost:3000/avatar/e086c1676bf9905147bb4908f6600f4a?d=identicon&r=g'
  },
  created_by: {
    id: '12939012390',
    email: 'chris@dignam.xyz',
    avatar_url: 'http://localhost:3000/avatar/e086c1676bf9905147bb4908f6600f4a?d=identicon&r=g'
  },
  }, {
    type: 'recipe_archived',
    actor: {id: '12391239012903', email: "chris@dignam.xyz",     avatar_url: 'http://localhost:3000/avatar/e086c1676bf9905147bb4908f6600f4a?d=identicon&r=g'},
    created: "2021"
  },
  {
    type: 'recipe_created',
    actor: {id: '12391239012903', email: "chris@dignam.xyz",     avatar_url: 'http://localhost:3000/avatar/e086c1676bf9905147bb4908f6600f4a?d=identicon&r=g'},
    created: "2019"
  }]
  return (
    <>
      <hr />
      <NoteCreator recipeId={props.recipeId} />
      {orderBy(notes, "created", "desc").map(note =>
  {

switch (note.type) {
  case 'note_created': {
    return <Note
          key={note.id}
          recipeId={props.recipeId}
          note={note}
          className="pb-4"
        />
  }
  case 'recipe_archived':
  case 'recipe_created': {
    return <TimelineEvent event={note}/>
  }
}



      })}
    </>
  )
}
