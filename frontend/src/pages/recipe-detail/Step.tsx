// https://github.com/react-dnd/react-dnd/tree/4d37ad5072ce8fb6a488a8672d5700676e643817/packages/documentation/examples/04%20Sortable/Simple

// BSD License

// Copyright (c) 2015, Facebook, Inc. All rights reserved.

// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:

//  * Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.

//  * Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.

//  * Neither the name Facebook nor the names of its contributors may be used to
//    endorse or promote products derived from this software without specific
//    prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import {
  Ellipsis,
  GripVertical,
  MoveDown,
  MoveUp,
  Pencil,
  Trash,
} from "lucide-react"
import { useRef, useState } from "react"
import { useFocusVisible } from "react-aria"
import { Menu, MenuTrigger, PressEvent, Separator } from "react-aria-components"
import { useDrag, useDrop } from "react-dnd"
import { CornerRightDown, CornerRightUp } from "react-feather"

import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { focusVisibleStyles } from "@/components/ButtonStyles"
import { BetterLabel } from "@/components/Label"
import { Markdown } from "@/components/Markdown"
import { MenuItem } from "@/components/MenuItem"
import { MenuPopover } from "@/components/MenuPopover"
import { Textarea } from "@/components/Textarea"
import { DragDrop, handleDndHover } from "@/dragDrop"
import { useStepCreate } from "@/queries/useStepCreate"
import { useStepDelete } from "@/queries/useStepDelete"
import { useStepUpdate } from "@/queries/useStepUpdate"

export function MoreButton() {
  // We don't want focus rings to appear on non-keyboard devices like iOS, so
  // we have to do some JS land stuff
  const { isFocusVisible } = useFocusVisible()
  return (
    <Button
      size="small"
      variant="nostyle"
      className={clx(
        "cursor-pointer rounded border-none bg-[unset] outline-none",
        focusVisibleStyles(isFocusVisible),
      )}
    >
      <Ellipsis className="text-[--color-text]" size={20} />
    </Button>
  )
}

interface IStepProps {
  readonly index: number
  readonly stepId: number
  readonly recipeID: number
  readonly text: string
  readonly move: (_: { from: number; to: number }) => void
  readonly completeMove: (_: { id: number; to: number }) => void
  readonly position: string
  readonly isEditing: boolean
}

export function Step({
  stepId,
  recipeID: recipeId,
  position,
  text,
  index,
  move,
  isEditing,
  completeMove,
  getAfterNextPosition,
  getBeforePreviousPosition,
  getNextPosition,
  getPreviousPosition,
}: IStepProps & {
  getAfterNextPosition: () => string
  getBeforePreviousPosition: () => string
  getNextPosition: () => string
  getPreviousPosition: () => string
}) {
  const [isEditingStep, setIsEditingStep] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const [, drop] = useDrop({
    accept: DragDrop.STEP,
    hover: handleDndHover({ ref, index, move }),
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: DragDrop.STEP,
    item: {
      index,
    },
    canDrag() {
      return isEditing
    },
    end: (draggedItem) => {
      completeMove({ id: stepId, to: draggedItem.index })
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  preview(drop(ref))

  return (
    <div
      ref={isEditing ? ref : undefined}
      className={clx("mb-2", isDragging && "opacity-0")}
    >
      <div className="flex justify-between">
        <div className="flex items-center">
          {isEditing && (
            <GripVertical size={18} className="-ml-1 cursor-move pr-1" />
          )}
          <BetterLabel
            ref={isEditing ? drag : undefined}
            cursor={isEditing ? "move" : undefined}
          >
            Step {index + 1}
          </BetterLabel>
        </div>

        {isEditing && (
          <StepEditMenu
            recipeId={recipeId}
            stepId={stepId}
            onEdit={() => {
              setIsEditingStep(true)
            }}
            getAfterNextPosition={getAfterNextPosition}
            getBeforePreviousPosition={getBeforePreviousPosition}
            getNextPosition={getNextPosition}
            getPreviousPosition={getPreviousPosition}
          />
        )}
      </div>
      <StepBody
        stepId={stepId}
        editingEnabled={isEditing}
        recipeID={recipeId}
        text={text}
        isEditingStep={isEditingStep}
        setIsEditingStep={setIsEditingStep}
      />
    </div>
  )
}

function StepEditMenu({
  recipeId,
  stepId,
  getAfterNextPosition,
  getBeforePreviousPosition,
  getNextPosition,
  getPreviousPosition,
  onEdit,
}: {
  recipeId: number
  stepId: number
  onEdit: () => void
  getAfterNextPosition: () => string
  getBeforePreviousPosition: () => string
  getNextPosition: () => string
  getPreviousPosition: () => string
}) {
  const remove = useStepDelete()
  const update = useStepUpdate()
  const addStep = useStepCreate()
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
          Edit Step… <Pencil size={14} />
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
      id: "add above",
      label: (
        <>
          Add Step Above… <CornerRightUp size={16} />
        </>
      ),
      onAction: () => {
        const position = getPreviousPosition()
        addStep.mutate({
          recipeId,
          step: "new step",
          position,
        })
      },
    },
    {
      type: "action",
      id: "add below",
      label: (
        <>
          Add Step Below… <CornerRightDown size={16} />
        </>
      ),
      onAction: () => {
        const position = getNextPosition()
        addStep.mutate({
          recipeId,
          step: "new step",
          position,
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
        update.mutate({
          recipeId,
          stepId,
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
        update.mutate({
          recipeId,
          stepId,
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
          Delete Step <Trash size={16} />
        </>
      ),
      onAction: () => {
        remove.mutate({ recipeId, stepId })
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

export function StepView({ text }: { text: string }) {
  return <Markdown>{text}</Markdown>
}

function StepBody({
  recipeID,
  text: propText,
  stepId,
  editingEnabled,
  setIsEditingStep,
  isEditingStep,
}: {
  readonly stepId: number
  readonly text: string
  readonly recipeID: number
  readonly editingEnabled: boolean
  setIsEditingStep: (_: boolean) => void
  isEditingStep: boolean
}) {
  const [text, setText] = useState(propText)
  const remove = useStepDelete()
  const update = useStepUpdate()

  const handleCancel = () => {
    setIsEditingStep(false)
    setText(propText)
  }

  const updateStep = (e?: { preventDefault?: () => void } | PressEvent) => {
    if (e && "preventDefault" in e) {
      e?.preventDefault?.()
    }

    // if the text is empty, we should just delete the item instead of updating
    if (text === "") {
      removeStep()
    } else {
      update.mutate(
        {
          recipeId: recipeID,
          stepId,
          update: {
            text,
          },
        },
        {
          onSuccess: () => {
            setIsEditingStep(false)
          },
        },
      )
    }
  }

  const removeStep = () => {
    remove.mutate({ recipeId: recipeID, stepId })
  }

  const inner = isEditingStep ? (
    <form className="flex flex-col gap-2">
      <Textarea
        autoFocus
        onChange={(e) => {
          setText(e.target.value)
        }}
        onKeyPress={(e) => {
          if (text === "") {
            return
          }
          if (e.metaKey && e.key === "Enter") {
            updateStep(e)
          }
        }}
        defaultValue={text}
        placeholder="Add you text here"
        name="text"
      />
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Button size="small" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={updateStep}
            loading={update.isPending}
          >
            Update Step
          </Button>
        </div>
      </div>
    </form>
  ) : (
    <StepView text={text} />
  )

  return (
    <div
      className={clx(editingEnabled && "cursor-pointer")}
      title={editingEnabled ? "click to edit" : undefined}
    >
      {inner}
    </div>
  )
}
