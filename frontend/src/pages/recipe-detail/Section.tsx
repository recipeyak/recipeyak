import {
  CornerRightUp,
  GripVertical,
  MoveDown,
  MoveUp,
  Pencil,
  Trash,
} from "lucide-react"
import React, { useState } from "react"
import { Menu, MenuTrigger, Separator } from "react-aria-components"
import { useDrag, useDrop } from "react-dnd"
import { CornerRightDown } from "react-feather"

import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { MenuItem } from "@/components/MenuItem"
import { MenuPopover } from "@/components/MenuPopover"
import { TextInput } from "@/components/TextInput"
import { DragDrop, handleDndHover } from "@/dragDrop"
import { MoreButton } from "@/pages/recipe-detail/Step"
import { useIngredientCreate } from "@/queries/useIngredientCreate"
import { useSectionCreate } from "@/queries/useSectionCreate"
import { useSectionDelete } from "@/queries/useSectionDelete"
import { useSectionUpdate } from "@/queries/useSectionUpdate"

export function Section({
  index,
  sectionId,
  recipeId,
  title,
  move,
  isEditing: editingEnabled,
  completeMove,
  getAfterNextPosition,
  getBeforePreviousPosition,
  getNextPosition,
  getPreviousPosition,
}: {
  readonly index: number
  readonly recipeId: number
  readonly sectionId: number
  readonly title: string
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
    readonly kind: "section"
    readonly id: number
    readonly to: number
  }) => void
  getAfterNextPosition: () => string
  getBeforePreviousPosition: () => string
  getNextPosition: () => string
  getPreviousPosition: () => string
}) {
  const updateSection = useSectionUpdate()
  const ref = React.useRef<HTMLLIElement>(null)
  const [localTitle, setLocalTitle] = useState(title)
  const [isEditing, setIsEditing] = useState(false)

  const handleCancel = () => {
    setLocalTitle(title)
    setIsEditing(false)
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
    canDrag() {
      return editingEnabled
    },
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

  preview(drag(drop(ref)))

  const addDisabled = localTitle === ""

  const inner = isEditing ? (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        updateSection.mutate(
          {
            recipeId,
            sectionId,
            update: {
              title: localTitle,
            },
          },
          {
            onSuccess: () => {
              setIsEditing(false)
            },
          },
        )
      }}
      className="flex w-full flex-col gap-2"
    >
      <TextInput
        onChange={(e) => {
          setLocalTitle(e.target.value)
        }}
        autoFocus
        value={localTitle}
        placeholder="for the sauce"
        name="section title"
      />
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Button onClick={handleCancel} size="small" type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={addDisabled}
            size="small"
            type="submit"
            loading={updateSection.isPending}
          >
            Update Section
          </Button>
        </div>
      </div>
      {updateSection.isError && <div>error adding ingredient</div>}
    </form>
  ) : (
    <div className="flex items-center gap-1">
      {editingEnabled && <GripVertical size={18} className="cursor-move" />}
      <span>{title}</span>
    </div>
  )

  return (
    <li
      ref={editingEnabled ? ref : undefined}
      className={clx(
        "mt-1 flex cursor-auto select-text items-start justify-between text-sm font-bold",
        isDragging && "opacity-0",
      )}
    >
      {inner}
      {editingEnabled && (
        <SectionEditMenu
          recipeId={recipeId}
          sectionId={sectionId}
          onEdit={() => {
            setIsEditing(true)
          }}
          getAfterNextPosition={getAfterNextPosition}
          getBeforePreviousPosition={getBeforePreviousPosition}
          getNextPosition={getNextPosition}
          getPreviousPosition={getPreviousPosition}
        />
      )}
    </li>
  )
}

function SectionEditMenu({
  sectionId,
  recipeId,
  onEdit,
  getAfterNextPosition,
  getBeforePreviousPosition,
  getNextPosition,
  getPreviousPosition,
}: {
  recipeId: number
  sectionId: number
  onEdit: () => void
  getAfterNextPosition: () => string
  getBeforePreviousPosition: () => string
  getNextPosition: () => string
  getPreviousPosition: () => string
}) {
  const sectionRemove = useSectionDelete()
  const sectionUpdate = useSectionUpdate()
  const sectionCreate = useSectionCreate()
  const ingredientCreate = useIngredientCreate()
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
          Edit Section… <Pencil size={14} />
        </>
      ),
      onAction: () => {
        onEdit()
      },
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
      type: "seperator",
    },
    {
      type: "action",
      id: "add above",
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
      id: "add below",
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
        sectionUpdate.mutate({
          recipeId,
          sectionId,
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
        sectionUpdate.mutate({
          recipeId,
          sectionId,
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
          Delete Section <Trash size={16} />
        </>
      ),
      onAction: () => {
        sectionRemove.mutate({ recipeId, sectionId })
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
