import React, { useState } from "react"
import { useDrag, useDrop } from "react-dnd"

import { isMobile } from "@/browser"
import cls from "@/classnames"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { FormControl } from "@/components/FormControl"
import { FormField } from "@/components/FormField"
import { CheckBox, TextInput } from "@/components/Forms"
import { DragDrop, handleDndHover } from "@/dragDrop"
import IngredientView from "@/pages/recipe-detail/IngredientView"
import { useIngredientDelete } from "@/queries/ingredientDelete"
import { useIngredientUpdate } from "@/queries/ingredientUpdate"

const emptyField = ({
  quantity,
  name,
}: {
  readonly quantity: string | undefined
  readonly name: string | undefined
}) => quantity === "" || name === ""

export function Ingredient(props: {
  readonly quantity: string
  readonly name: string
  readonly description: string
  readonly optional: boolean
  readonly recipeID: number
  readonly ingredientId: number
  readonly index: number
  readonly isEditing: boolean
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
    readonly kind: "ingredient"
    readonly id: number
    readonly to: number
  }) => void
}) {
  const [quantity, setQuantity] = useState(props.quantity)
  const [name, setName] = useState(props.name)
  const [description, setDescription] = useState(props.description)
  const [optional, setOptional] = useState(props.optional)
  const [editing, setEditing] = useState(false)
  const ref = React.useRef<HTMLLIElement>(null)

  const removeIngredient = useIngredientDelete()
  const updateIngredient = useIngredientUpdate()

  const resetFields = () => {
    setQuantity(props.quantity)
    setName(props.name)
    setDescription(props.description)
    setOptional(props.optional)
    setEditing(false)
  }

  const enableEditing = () => {
    resetFields()
    setEditing(true)
  }

  const handleCancelButton = () => {
    resetFields()
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateIngredient.mutate(
      {
        recipeId: props.recipeID,
        ingredientId: props.ingredientId,
        update: {
          quantity,
          name,
          description,
          optional,
        },
      },
      {
        onSuccess: () => {
          setEditing(false)
        },
      },
    )
  }

  const [, drop] = useDrop({
    accept: [DragDrop.SECTION, DragDrop.INGREDIENT],
    hover: handleDndHover({
      ref,
      index: props.index,
      move: props.move,
    }),
  })

  const [{ isDragging }, drag] = useDrag({
    type: DragDrop.INGREDIENT,
    item: {
      index: props.index,
    },
    canDrag() {
      return props.isEditing
    },
    end: (draggedItem) => {
      props.completeMove({
        kind: "ingredient",
        id: props.ingredientId,
        to: draggedItem.index,
      })
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const dragAndDropEnabled = !isMobile()

  const style = {
    opacity: isDragging ? 0 : 1,
  }

  if (dragAndDropEnabled) {
    drop(ref)
  }

  const inner = editing ? (
    <form onSubmit={handleSubmit}>
      <FormField>
        <div className="add-ingredient-grid">
          <TextInput
            onChange={(e) => {
              setQuantity(e.target.value)
            }}
            autoFocus
            value={quantity}
            className="input-quantity"
            placeholder="3 lbs"
          />

          <TextInput
            onChange={(e) => {
              setName(e.target.value)
            }}
            value={name}
            className="input-ingredient"
            placeholder="tomato"
          />

          <TextInput
            onChange={(e) => {
              setDescription(e.target.value)
            }}
            value={description}
            className="input-ingredient grid-entire-row"
            placeholder="diced at 3cm in width"
          />
        </div>
      </FormField>

      <label className="d-flex align-items-center cursor-pointer mb-2">
        <CheckBox
          onChange={() => {
            setOptional((prev) => !prev)
          }}
          checked={optional}
          className="mr-2"
        />
        Optional
      </label>

      <Box space="between">
        <FormField isGrouped>
          <FormControl>
            <Button
              type="button"
              onClick={() => {
                removeIngredient.mutate({
                  recipeId: props.recipeID,
                  ingredientId: props.ingredientId,
                })
              }}
              size="small"
              loading={removeIngredient.isLoading}
            >
              Delete
            </Button>
          </FormControl>
        </FormField>
        <FormField isGrouped>
          <FormControl>
            <Button type="reset" onClick={handleCancelButton} size="small">
              Cancel
            </Button>
          </FormControl>
          <FormControl>
            <Button
              variant="primary"
              size="small"
              type="submit"
              disabled={emptyField({ quantity, name })}
              loading={updateIngredient.isLoading}
            >
              Update
            </Button>
          </FormControl>
        </FormField>
      </Box>
    </form>
  ) : (
    <IngredientView
      dragRef={props.isEditing && dragAndDropEnabled ? drag : undefined}
      quantity={props.quantity}
      name={props.name}
      description={props.description}
      optional={props.optional}
    />
  )

  return (
    <li
      ref={props.isEditing && dragAndDropEnabled ? ref : undefined}
      style={style}
    >
      <section
        title={props.isEditing ? "click to edit" : undefined}
        className={cls({ "cursor-pointer": props.isEditing })}
        onClick={() => {
          if (props.isEditing && !editing) {
            enableEditing()
          }
        }}
      >
        {inner}
      </section>
    </li>
  )
}
