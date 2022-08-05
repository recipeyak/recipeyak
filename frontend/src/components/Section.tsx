import React from "react"
import { useDrag, useDrop } from "react-dnd"

import * as api from "@/api"
import { AddSectionFormInner } from "@/components/AddSectionForm"
import { DragDrop, handleDndHover } from "@/dragDrop"
import { useDispatch } from "@/hooks"
import { isOk } from "@/result"
import {
  removeSectionFromRecipe,
  updateSectionForRecipe,
} from "@/store/reducers/recipes"
import { Status } from "@/webdata"

type State = {
  readonly updating: Status
  readonly removing: Status
  readonly editing: boolean
  readonly localTitle: string
}

function getInitialState(title: string) {
  return {
    updating: "initial",
    removing: "initial",
    editing: false,
    localTitle: title,
  } as const
}

export function Section({
  index,
  sectionId,
  recipeId,
  title,
  move,
  completeMove,
}: {
  readonly index: number
  readonly recipeId: number
  readonly sectionId: number
  readonly title: string
  readonly move: ({
    from,
    to,
  }: {
    readonly from: number
    readonly to: number
  }) => void
  readonly completeMove: ({
    kind,
    id,
    to,
  }: {
    readonly kind: "section"
    readonly id: number
    readonly to: number
  }) => void
}) {
  const dispatch = useDispatch()
  const ref = React.useRef<HTMLLIElement>(null)
  const [state, setState] = React.useState<State>(getInitialState(title))
  React.useEffect(() => {
    setState((prev) => ({ ...prev, localTitle: title }))
  }, [title])

  const handleEnableEditing = () => {
    setState((prev) => ({ ...prev, editing: true }))
  }

  const handleCancel = () => {
    setState(getInitialState(title))
  }
  const handleRemove = () => {
    setState((prev) => ({ ...prev, removing: "loading" }))
    void api.deleteSection({ sectionId }).then((res) => {
      if (isOk(res)) {
        dispatch(removeSectionFromRecipe({ recipeId, sectionId }))
      } else {
        setState((prev) => ({ ...prev, removing: "failure" }))
      }
    })
  }
  const handleSave = () => {
    setState((prev) => ({ ...prev, updating: "loading" }))
    void api
      .updateSection({ sectionId, title: state.localTitle })
      .then((res) => {
        if (isOk(res)) {
          dispatch(
            updateSectionForRecipe({
              recipeId,
              sectionId,
              title: res.data.title,
              position: res.data.position,
            }),
          )
          setState((prev) => ({ ...prev, updating: "success", editing: false }))
        } else {
          setState((prev) => ({ ...prev, updating: "failure" }))
        }
      })
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localTitle = e.target.value
    setState((prev) => ({ ...prev, localTitle }))
  }
  const [, drop] = useDrop({
    accept: [DragDrop.SECTION, DragDrop.INGREDIENT],
    hover: handleDndHover({
      ref,
      index,
      move,
    }),
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: DragDrop.SECTION,
    item: {
      index,
    },
    end: () => {
      completeMove({ kind: "section", id: sectionId, to: index })
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const style: React.CSSProperties = {
    opacity: isDragging ? 0 : 1,
  }

  preview(drag(drop(ref)))

  if (state.editing) {
    return (
      <li ref={ref} style={style}>
        <AddSectionFormInner
          onSave={handleSave}
          onCancel={handleCancel}
          onRemove={handleRemove}
          status={state.updating}
          value={state.localTitle}
          onChange={handleInputChange}
          toggleShowAddSection={null}
          removing={state.removing}
        />
      </li>
    )
  }

  return (
    <li
      ref={ref}
      style={style}
      className="bg-white mt-1 bold text-small"
      title="click to edit"
      onClick={handleEnableEditing}
    >
      {title}
    </li>
  )
}
