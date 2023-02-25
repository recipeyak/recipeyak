import React, { useState } from "react"
import { useDrag, useDrop } from "react-dnd"

import { Button } from "@/components/Buttons"
import { FormControl } from "@/components/FormControl"
import { FormField } from "@/components/FormField"
import { TextInput } from "@/components/Forms"
import { DragDrop, handleDndHover } from "@/dragDrop"
import { useSectionDelete } from "@/queries/sectionDelete"
import { useSectionUpdate } from "@/queries/sectionUpdate"

export function Section({
  index,
  sectionId,
  recipeId,
  title,
  move,
  isEditing: editingEnabled,
  completeMove,
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
}) {
  const deleteSection = useSectionDelete()
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

  const style: React.CSSProperties = {
    opacity: isDragging ? 0 : 1,
  }

  preview(drag(drop(ref)))

  const addDisabled = localTitle === ""

  if (isEditing) {
    return (
      <li ref={ref} style={style}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateSection.mutate({
              recipeId,
              sectionId,
              update: {
                title: localTitle,
              },
            })
          }}
        >
          <div className="mb-2 mt-2">
            <TextInput
              onChange={(e) => {
                setLocalTitle(e.target.value)
              }}
              autoFocus
              value={localTitle}
              placeholder="for the sauce"
              name="section title"
            />
          </div>
          <FormField isGrouped>
            <FormControl className="flex-grow">
              <Button
                size="small"
                type="button"
                onClick={() => {
                  deleteSection.mutate({
                    recipeId,
                    sectionId,
                  })
                }}
                loading={deleteSection.isLoading}
              >
                Delete
              </Button>
            </FormControl>
            <FormControl>
              <Button
                onClick={handleCancel}
                size="small"
                type="button"
                name="cancel add ingredient"
              >
                Cancel
              </Button>
            </FormControl>
            <FormControl>
              <Button
                variant="primary"
                disabled={addDisabled}
                size="small"
                type="submit"
                loading={updateSection.isLoading}
              >
                Save
              </Button>
            </FormControl>
          </FormField>
          {updateSection.isError && <p>error adding ingredient</p>}
        </form>
      </li>
    )
  }

  return (
    <li
      ref={editingEnabled ? ref : undefined}
      style={style}
      className="mt-1 bold text-small"
      title={editingEnabled ? "click to edit" : undefined}
      onClick={() => {
        if (editingEnabled) {
          setIsEditing(true)
        }
      }}
    >
      {title}
    </li>
  )
}
