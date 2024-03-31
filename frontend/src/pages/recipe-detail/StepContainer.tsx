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

import { sortBy } from "lodash-es"
import React, { useEffect } from "react"

import { positionAfter, positionBefore, positionBetween } from "@/ordering"
import { Step } from "@/pages/recipe-detail/Step"
import { getNewPos } from "@/position"
import { RecipeFetchResponse } from "@/queries/useRecipeFetch"
import { useStepUpdate } from "@/queries/useStepUpdate"

interface IStepContainerProps {
  readonly steps: RecipeFetchResponse["steps"]
  readonly recipeID: number
  readonly isEditing: boolean
}

function StepContainer(props: IStepContainerProps) {
  const [steps, setSteps] = React.useState(props.steps)

  const updateStep = useStepUpdate()

  useEffect(() => {
    setSteps(sortBy(props.steps, "position"))
  }, [props.steps])

  const move = ({
    from,
    to,
  }: {
    readonly to: number
    readonly from: number
  }) => {
    setSteps((prev) => {
      const newSteps = [...prev]
      const item = newSteps[from]
      newSteps.splice(from, 1)
      newSteps.splice(to, 0, item)
      return newSteps
    })
  }

  const completeMove = ({ to, id: stepID }: { id: number; to: number }) => {
    const newPosition = getNewPos(steps, to)
    if (newPosition == null) {
      return
    }
    setSteps((prevSteps) =>
      prevSteps.map((c) => {
        if (c.id === stepID) {
          return {
            ...c,
            position: newPosition,
          }
        }
        return c
      }),
    )
    updateStep.mutate({
      recipeId: props.recipeID,
      stepId: stepID,
      update: {
        position: newPosition,
      },
    })
  }

  return (
    <>
      {steps.map((step, i) => (
        <Step
          key={step.id}
          index={i}
          stepId={step.id}
          recipeID={props.recipeID}
          text={step.text}
          move={move}
          isEditing={props.isEditing}
          position={step.position}
          getAfterNextPosition={() => {
            // is last, we can't move next
            if (i === steps.length - 1) {
              return step.position
            }
            const next = steps[i + 1].position
            const nextNext = steps[i + 2].position
            // next is the last position
            if (nextNext == null) {
              return positionAfter(next)
            }
            return positionBetween(next, nextNext)
          }}
          getBeforePreviousPosition={() => {
            // is first, we can't move before
            if (i === 0) {
              return step.position
            }
            const prev = steps[i - 1].position
            const prevPrev = steps[i - 2]?.position
            if (prevPrev == null) {
              return positionBefore(prev)
            }
            return positionBetween(prevPrev, prev)
          }}
          getNextPosition={() => {
            if (i === steps.length - 1) {
              return positionAfter(step.position)
            }
            const next = steps[i].position
            const nextNext = steps[i + 1].position
            return positionBetween(next, nextNext)
          }}
          getPreviousPosition={() => {
            if (i === 0) {
              return positionBefore(step.position)
            }
            const prev = steps[i].position
            const prevPrev = steps[i - 1].position
            return positionBetween(prevPrev, prev)
          }}
          completeMove={completeMove}
        />
      ))}
    </>
  )
}

export default StepContainer
