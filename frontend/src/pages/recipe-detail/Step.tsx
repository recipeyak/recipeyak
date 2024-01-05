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

import React, { useRef, useState } from "react"
import { useDrag, useDrop } from "react-dnd"

import { clx } from "@/classnames"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Textarea } from "@/components/Forms"
import { BetterLabel } from "@/components/Label"
import { Markdown } from "@/components/Markdown"
import { DragDrop, handleDndHover } from "@/dragDrop"
import { useStepDelete } from "@/queries/stepDelete"
import { useStepUpdate } from "@/queries/stepUpdate"

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

function Step({
  stepId,
  recipeID,
  text,
  index,
  move,
  isEditing,
  completeMove,
}: IStepProps) {
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

  const style = {
    opacity: isDragging ? 0 : 1,
  }

  preview(drop(ref))
  return (
    <div style={style} ref={isEditing ? ref : undefined} className="mb-2">
      <BetterLabel
        ref={isEditing ? drag : undefined}
        cursor={isEditing ? "move" : undefined}
      >
        Step {index + 1}
      </BetterLabel>
      <StepBody
        stepId={stepId}
        isEditing={isEditing}
        recipeID={recipeID}
        text={text}
      />
    </div>
  )
}

export function StepView({ text }: { text: string }) {
  return <Markdown>{text}</Markdown>
}

function StepBody({
  recipeID,
  text: propText,
  stepId,
  isEditing: editingEnabled,
}: {
  readonly stepId: number
  readonly text: string
  readonly recipeID: number
  readonly isEditing: boolean
}) {
  const [text, setText] = useState(propText)
  const [isEditing, setIsEditing] = useState(false)
  const remove = useStepDelete()
  const update = useStepUpdate()

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(false)
    setText(propText)
  }

  const updateStep = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault()
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
            setIsEditing(false)
          },
        },
      )
    }
  }

  const removeStep = () => {
    remove.mutate({ recipeId: recipeID, stepId })
  }

  const inner = isEditing ? (
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
      <Box space="between">
        <Button
          onClick={removeStep}
          size="small"
          loading={remove.isPending}
          type="button"
        >
          Delete
        </Button>
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
            Save
          </Button>
        </div>
      </Box>
    </form>
  ) : (
    <StepView text={text} />
  )

  return (
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line react/forbid-elements
    <section
      className={clx(editingEnabled && "cursor-pointer")}
      title={editingEnabled ? "click to edit" : undefined}
      onClick={() => {
        if (!editingEnabled) {
          return
        }
        setIsEditing(true)
      }}
    >
      {inner}
    </section>
  )
}

export default Step
