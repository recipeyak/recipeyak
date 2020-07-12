import React from "react"

import IngredientView from "@/components/IngredientView"
import GlobalEvent from "@/components/GlobalEvent"
import { Button, ButtonLink } from "@/components/Buttons"
import { TextInput, selectTarget, CheckBox } from "@/components/Forms"
import { hasSelection } from "@/utils/general"
import { useDrop, useDrag } from "react-dnd"
import { DragDrop } from "@/dragDrop"

const emptyField = ({
  quantity,
  name
}: {
  readonly quantity: string | undefined
  readonly name: string | undefined
}) => quantity === "" || name === ""

const allEmptyFields = ({
  quantity,
  name,
  description
}: {
  readonly quantity?: string
  readonly name?: string
  readonly description?: string
}) => quantity === "" && name === "" && description === ""

type IngredientState = {
  readonly quantity: string
  readonly name: string
  readonly description: string
  readonly optional: boolean
  readonly editing: boolean
  readonly unsavedChanges: boolean
}

export function Ingredient(props: {
  readonly quantity: string
  readonly name: string
  readonly description: string
  readonly optional: boolean
  readonly recipeID: number
  readonly id: number
  readonly updating?: boolean
  readonly removing?: boolean
  readonly index: number
  readonly remove: (recipeID: number, id: number) => void
  readonly update: ({
    quantity,
    name,
    description,
    optional
  }: {
    readonly quantity: string
    readonly name: string
    readonly description: string
    readonly optional: boolean
  }) => void
  readonly move?: ({
    from,
    to
  }: {
    readonly from: number
    readonly to: number
  }) => void
  readonly completeMove?: ({
    id,
    to
  }: {
    readonly id: number
    readonly to: number
  }) => void
}) {
  const [state, setState] = React.useState<IngredientState>({
    quantity: props.quantity,
    name: props.name,
    description: props.description,
    optional: props.optional,
    editing: false,
    unsavedChanges: false
  })

  const ref = React.useRef<HTMLLIElement>(null)
  // ensures that the list item closes when the user clicks outside of the item
  const handleGeneralClick = (e: MouseEvent) => {
    const el = ref.current
    const target = e.target as HTMLElement | null
    if (el == null || target == null) {
      return
    }
    const clickedInComponent = el.contains(target)
    if (clickedInComponent) {
      return
    }
    setState(prevState => {
      const contentChanged =
        prevState.quantity !== props.quantity ||
        prevState.name !== props.name ||
        prevState.description !== props.description
      return {
        ...prevState,
        editing: false,
        unsavedChanges:
          (prevState.editing && contentChanged) || prevState.unsavedChanges
      }
    })
  }

  const handleGeneralKeyup = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      cancel()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name
    const value = e.target.value
    setState(s => ({
      ...s,
      [name]: value
    }))
  }

  const toggleOptional = () =>
    setState(prev => ({ ...prev, optional: !prev.optional }))

  const enableEditing = () => {
    if (hasSelection()) {
      return
    }
    // FIXME(chdsbd): This is identical to the method in ListItem
    setState(s => ({
      ...s,
      editing: true,
      unsavedChanges: false
    }))
  }

  const discardChanges = () =>
    setState(s => ({
      ...s,
      editing: false,
      unsavedChanges: false,
      quantity: props.quantity,
      name: props.quantity,
      description: props.description
    }))

  const cancel = () =>
    // Restore state to match props
    setState(s => ({
      ...s,
      editing: false,
      quantity: props.quantity,
      name: props.name,
      description: props.description
    }))

  const handleCancelButton = (e: React.MouseEvent) => {
    e.stopPropagation()
    cancel()
  }

  const update = async (e: React.FormEvent) => {
    e.preventDefault()
    if (emptyField(state)) {
      return
    }

    e.stopPropagation()

    if (allEmptyFields(state)) {
      return remove()
    }

    props.update({
      quantity: state.quantity,
      name: state.name,
      description: state.description,
      optional: state.optional
    })

    setState(s => ({
      ...s,
      editing: false,
      unsavedChanges: false
    }))
  }

  const remove = () => props.remove(props.recipeID, props.id)

  const [, drop] = useDrop({
    accept: DragDrop.INGREDIENT,
    hover: (_item, monitor) => {
      if (!ref.current) {
        return
      }

      // tslint:disable-next-line:no-unsafe-any
      const dragIndex: number = monitor.getItem().index
      const hoverIndex = props.index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const el = ref.current
      const hoverBoundingRect = el.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      if (clientOffset == null) {
        return
      }

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      props.move?.({ from: dragIndex, to: hoverIndex })

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      // tslint:disable-next-line:no-unsafe-any
      monitor.getItem().index = hoverIndex
    }
  })

  const [{ isDragging }, drag, preview] = useDrag({
    item: {
      type: DragDrop.INGREDIENT,
      id: props.id,
      index: props.index,
      position: props.index,
      data: {
        foo: "bar"
      }
    },
    end: () => {
      props.completeMove?.({ id: props.id, to: props.index })
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  })

  const dragAndDropEnabled = props.completeMove != null && props.move != null

  const style = {
    backgroundColor: "white",
    opacity: isDragging ? 0 : 1
  }

  if (dragAndDropEnabled) {
    preview(drop(ref))
  }

  const inner = state.editing ? (
    <form onSubmit={update}>
      <GlobalEvent mouseUp={handleGeneralClick} keyUp={handleGeneralKeyup} />
      <div className="field">
        <div className="add-ingredient-grid">
          <TextInput
            onChange={handleInputChange}
            autoFocus
            onFocus={selectTarget}
            value={state.quantity}
            className="input-quantity"
            placeholder="3 lbs"
            name="quantity"
          />

          <TextInput
            onChange={handleInputChange}
            onFocus={selectTarget}
            value={state.name}
            className="input-ingredient"
            placeholder="tomato"
            name="name"
          />

          <TextInput
            onChange={handleInputChange}
            onFocus={selectTarget}
            value={state.description}
            className="input-ingredient grid-entire-row"
            placeholder="diced at 3cm in width"
            name="description"
          />
        </div>
      </div>

      <label className="d-flex align-items-center cursor-pointer mb-2">
        <CheckBox
          onChange={toggleOptional}
          checked={state.optional}
          name="optional"
          className="mr-2"
        />
        Optional
      </label>

      <section className="listitem-button-container">
        <div className="field is-grouped">
          <p className="control">
            <Button
              size="small"
              type="submit"
              name="update"
              loading={props.updating}>
              Update
            </Button>
          </p>
          <p className="control">
            <Button
              onClick={handleCancelButton}
              size="small"
              type="reset"
              name="cancel edit">
              Cancel
            </Button>
          </p>
        </div>
        <div className="field is-grouped">
          <p className="control">
            <Button
              onClick={remove}
              size="small"
              loading={props.removing}
              name="remove">
              Remove
            </Button>
          </p>
        </div>
      </section>
    </form>
  ) : (
    <IngredientView
      dragRef={dragAndDropEnabled ? drag : undefined}
      quantity={state.quantity}
      name={state.name}
      description={state.description}
      optional={state.optional}
    />
  )

  return (
    <li ref={dragAndDropEnabled ? ref : undefined} style={style}>
      <section
        title="click to edit"
        className="cursor-pointer"
        onClick={enableEditing}>
        {inner}
      </section>
      {state.unsavedChanges && (
        <section className="d-flex justify-space-between align-center">
          <span className="is-italic fs-4">Unsaved Changes</span>
          <section>
            <ButtonLink size="small" onClick={enableEditing}>
              View Edits
            </ButtonLink>
            <ButtonLink size="small" onClick={discardChanges}>
              Discard
            </ButtonLink>
          </section>
        </section>
      )}
    </li>
  )
}
