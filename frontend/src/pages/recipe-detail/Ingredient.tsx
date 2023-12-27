import React, { useState } from "react"
import { useDrag, useDrop } from "react-dnd"

import { isMobile } from "@/browser"
import { clx } from "@/classnames"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
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

  if (dragAndDropEnabled) {
    drop(ref)
  }

  const inner = editing ? (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <TextInput
            onChange={(e) => {
              setQuantity(e.target.value)
            }}
            autoFocus
            value={quantity}
            className="!w-1/3"
            placeholder="3 lbs"
          />

          <TextInput
            onChange={(e) => {
              setName(e.target.value)
            }}
            value={name}
            className=" !w-2/3"
            placeholder="tomato"
          />
        </div>

        <TextInput
          onChange={(e) => {
            setDescription(e.target.value)
          }}
          value={description}
          className="col-span-full"
          placeholder="diced at 3cm in width"
        />
      </div>

      <label className="flex cursor-pointer items-center">
        <CheckBox
          onChange={() => {
            setOptional((prev) => !prev)
          }}
          checked={optional}
          className="mr-2"
        />
        Optional
      </label>

      <Box space="between" mb={2}>
        <Button
          type="button"
          onClick={() => {
            removeIngredient.mutate({
              recipeId: props.recipeID,
              ingredientId: props.ingredientId,
            })
          }}
          size="small"
          loading={removeIngredient.isPending}
        >
          Delete
        </Button>
        <div className="flex gap-2">
          <Button type="reset" onClick={handleCancelButton} size="small">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="small"
            type="submit"
            disabled={emptyField({ quantity, name })}
            loading={updateIngredient.isPending}
          >
            Update
          </Button>
        </div>
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
      title={props.isEditing ? "click to edit" : undefined}
      className={clx(
        props.isEditing && "cursor-pointer",
        isDragging && "opacity-0",
      )}
      onClick={() => {
        if (props.isEditing && !editing) {
          enableEditing()
        }
      }}
    >
      {inner}
    </li>
  )
}
