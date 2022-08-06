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
import { connect } from "react-redux"

import Step from "@/components/Step"
import { getNewPos } from "@/position"
import { IRecipe, IStep, updateStep } from "@/store/reducers/recipes"

interface IStepContainerProps {
  readonly steps: ReadonlyArray<IStep>
  readonly recipeID: IRecipe["id"]
  readonly updatingStep: ({
    recipeID,
    stepID,
    text,
    position,
  }: {
    text?: string
    position?: number
    recipeID: number
    stepID: number
  }) => void
}

function StepContainer(props: IStepContainerProps) {
  const [steps, setSteps] = React.useState(props.steps)

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
    props.updatingStep({
      recipeID: props.recipeID,
      stepID,
      position: newPosition,
    })
  }

  return (
    <>
      {steps.map((card, i) => (
        <Step
          key={card.id}
          index={i}
          id={card.id}
          recipeID={props.recipeID}
          text={card.text}
          move={move}
          position={card.position}
          updating={card.updating}
          removing={card.removing}
          completeMove={completeMove}
        />
      ))}
    </>
  )
}

const mapDispatchToProps = {
  updatingStep: updateStep.request,
}

export default connect(null, mapDispatchToProps)(StepContainer)
