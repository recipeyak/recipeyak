import {
  CornerRightDown,
  CornerRightUp,
  MoveDown,
  MoveUp,
  Pencil,
  Trash,
} from "lucide-react"
import React, { useState } from "react"
import { Menu, MenuTrigger, Separator } from "react-aria-components"
import { useDrag, useDrop } from "react-dnd"

import { isMobile } from "@/browser"
import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { CheckBox } from "@/components/Checkbox"
import { MenuItem } from "@/components/MenuItem"
import { MenuPopover } from "@/components/MenuPopover"
import { TextInput } from "@/components/TextInput"
import { DragDrop, handleDndHover } from "@/dragDrop"
import IngredientView from "@/pages/recipe-detail/IngredientView"
import { MoreButton } from "@/pages/recipe-detail/Step"
import { useIngredientCreate } from "@/queries/useIngredientCreate"
import { useIngredientDelete } from "@/queries/useIngredientDelete"
import { useIngredientUpdate } from "@/queries/useIngredientUpdate"
import { useSectionCreate } from "@/queries/useSectionCreate"

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
  position: string
  getAfterNextPosition: () => string
  getBeforePreviousPosition: () => string
  getNextPosition: () => string
  getPreviousPosition: () => string
}) {
  const [quantity, setQuantity] = useState(props.quantity)
  const [name, setName] = useState(props.name)
  const [description, setDescription] = useState(props.description)
  const [optional, setOptional] = useState(props.optional)
  const [editing, setEditing] = useState(false)
  const ref = React.useRef<HTMLLIElement>(null)

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
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
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

      <div className="mb-2 flex justify-end">
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
            Update Ingredient
          </Button>
        </div>
      </div>
    </form>
  ) : (
    <IngredientView
      isEditing={props.isEditing}
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
      className={clx(
        props.isEditing && "cursor-pointer",
        isDragging && "opacity-0",
        "flex items-start justify-between gap-1",
      )}
    >
      {inner}
      {props.isEditing && (
        <IngredientEditMenu
          recipeId={props.recipeID}
          ingredientId={props.ingredientId}
          onEdit={enableEditing}
          getAfterNextPosition={props.getAfterNextPosition}
          getBeforePreviousPosition={props.getBeforePreviousPosition}
          getNextPosition={props.getNextPosition}
          getPreviousPosition={props.getPreviousPosition}
        />
      )}
    </li>
  )
}

function IngredientEditMenu({
  ingredientId,
  recipeId,
  onEdit,
  getAfterNextPosition,
  getBeforePreviousPosition,
  getNextPosition,
  getPreviousPosition,
}: {
  recipeId: number
  ingredientId: number
  onEdit: () => void
  getAfterNextPosition: () => string
  getBeforePreviousPosition: () => string
  getNextPosition: () => string
  getPreviousPosition: () => string
}) {
  const ingredientRemove = useIngredientDelete()
  const ingredientUpdate = useIngredientUpdate()
  const ingredientCreate = useIngredientCreate()

  const sectionCreate = useSectionCreate()
  const actions: Array<
    | {
        type: "action"
        id: string
        label: React.ReactNode
        onAction: () => void
        isDestructive?: boolean
      }
    | {
        type: "seperator"
      }
  > = [
    {
      type: "action",
      id: "edit",
      label: (
        <>
          Edit Ingredient… <Pencil size={14} />
        </>
      ),
      onAction: () => {
        onEdit()
      },
    },
    {
      type: "seperator",
    },
    {
      type: "action",
      id: "add ingredient above",
      label: (
        <>
          Add Ingredient Above… <CornerRightUp size={16} />
        </>
      ),
      onAction: () => {
        const position = getPreviousPosition()
        ingredientCreate.mutate({
          recipeId,
          payload: {
            position,
            quantity: "",
            name: "new ingredient",
            description: "",
            optional: false,
          },
        })
      },
    },
    {
      type: "action",
      id: "add ingredient below",
      label: (
        <>
          Add Ingredient Below… <CornerRightDown size={16} />
        </>
      ),
      onAction: () => {
        const position = getNextPosition()
        ingredientCreate.mutate({
          recipeId,
          payload: {
            position,
            quantity: "",
            name: "new ingredient",
            description: "",
            optional: false,
          },
        })
      },
    },
    {
      type: "seperator",
    },
    {
      type: "action",
      id: "add section above",
      label: (
        <>
          Add Section Above… <CornerRightUp size={16} />
        </>
      ),
      onAction: () => {
        const position = getPreviousPosition()
        sectionCreate.mutate({
          recipeId,
          payload: {
            position,
            title: "new section",
          },
        })
      },
    },
    {
      type: "action",
      id: "add section below",
      label: (
        <>
          Add Section Below… <CornerRightDown size={16} />
        </>
      ),
      onAction: () => {
        const position = getNextPosition()
        sectionCreate.mutate({
          recipeId,
          payload: {
            position,
            title: "new section",
          },
        })
      },
    },
    {
      type: "seperator",
    },
    {
      type: "action",
      id: "move up",
      label: (
        <>
          Move Up <MoveUp size={16} />
        </>
      ),
      onAction: () => {
        const position = getBeforePreviousPosition()
        ingredientUpdate.mutate({
          recipeId,
          ingredientId,
          update: { position },
        })
      },
    },
    {
      type: "action",
      id: "move down",
      label: (
        <>
          Move Down <MoveDown size={16} />
        </>
      ),
      onAction: () => {
        const position = getAfterNextPosition()
        ingredientUpdate.mutate({
          recipeId,
          ingredientId,
          update: { position },
        })
      },
    },
    {
      type: "seperator",
    },
    {
      type: "action",
      id: "delete",
      isDestructive: true,
      label: (
        <>
          Delete Ingredient <Trash size={16} />
        </>
      ),
      onAction: () => {
        ingredientRemove.mutate({ recipeId, ingredientId })
      },
    },
  ]
  return (
    <MenuTrigger>
      <MoreButton />
      <MenuPopover>
        <Menu
          className="outline-none"
          onAction={(actionId) => {
            const action = actions.find(
              (x) => x.type === "action" && x.id === actionId,
            )
            if (action?.type === "action") {
              action.onAction()
            }
          }}
        >
          {actions.map((action, idx) => {
            if (action.type === "seperator") {
              return (
                <Separator
                  key={"sep" + idx}
                  className="my-1 h-[1px] bg-[--color-border]"
                />
              )
            } else {
              return (
                <MenuItem
                  id={action.id}
                  key={action.id}
                  isDestructive={action.isDestructive}
                >
                  {action.label}
                </MenuItem>
              )
            }
          })}
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  )
}
