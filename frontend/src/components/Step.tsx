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

import React from "react"
import { connect } from "react-redux"
import { findDOMNode } from "react-dom"
import {
  DragSource,
  DropTarget,
  ConnectDragSource,
  ConnectDropTarget,
  ConnectDragPreview,
  DropTargetMonitor
} from "react-dnd"
import { DragDrop } from "@/dragDrop"
import ListItem from "@/components/ListItem"

import {
  IStep,
  IRecipe,
  updateStep,
  deleteStep
} from "@/store/reducers/recipes"

const stepSource = {
  beginDrag(props: IStepProps) {
    return {
      id: props.id,
      index: props.index,
      position: props.position
    }
  },
  endDrag(props: IStepProps) {
    props.completeMove(props.id, props.index)
  }
}

const stepTarget = {
  hover(
    props: IStepProps,
    monitor: DropTargetMonitor,
    component: React.Component
  ) {
    // tslint:disable-next-line:no-unsafe-any
    const dragIndex: number = monitor.getItem().index
    const hoverIndex = props.index

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }

    // Determine rectangle on screen
    const el = findDOMNode(component) as HTMLDivElement | null
    if (el == null) {
      return
    }
    const hoverBoundingRect = el.getBoundingClientRect()

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

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
    props.moveStep(dragIndex, hoverIndex)

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    // tslint:disable-next-line:no-unsafe-any
    monitor.getItem().index = hoverIndex
  }
}

interface ICollectedProps {
  readonly connectDragSource: ConnectDragSource
  readonly connectDropTarget: ConnectDropTarget
  readonly connectDragPreview: ConnectDragPreview

  readonly isDragging: boolean
}

interface IStepProps {
  readonly index: number
  readonly id: number
  readonly recipeID: IRecipe["id"]
  readonly text: string
  readonly moveStep: (dragIndex: number, hoverIndex: number) => void
  readonly completeMove: (dragIndex: number, hoverIndex: number) => void
  readonly updating?: boolean
  readonly removing?: boolean
  readonly position?: number
}

function Step({
  text,
  isDragging,
  connectDragSource,
  connectDropTarget,
  connectDragPreview,
  index,
  ...props
}: IStepProps & ICollectedProps) {
  const style = {
    backgroundColor: "white",
    opacity: isDragging ? 0 : 1
  }
  return connectDragPreview(
    connectDropTarget(
      <div style={style} className="mb-2">
        {connectDragSource(
          <label className="better-label" style={{ cursor: "move" }}>
            Step {index + 1}
          </label>
        )}
        <StepBody
          id={props.id}
          recipeID={props.recipeID}
          updating={props.updating}
          removing={props.removing}
          text={text}
        />
      </div>
    )
  )
}

interface IStepBodyBasic {
  readonly id: IStep["id"]
  readonly recipeID: IRecipe["id"]
  readonly text: IStep["text"]
  readonly updating?: boolean
  readonly removing?: boolean
  readonly update: (data: {
    recipeID: number
    stepID: number
    text?: string
  }) => void
  readonly remove: (data: { recipeID: IRecipe["id"]; stepID: number }) => void
}

function StepBodyBasic({
  recipeID,
  id,
  text,
  update,
  remove,
  updating,
  removing
}: IStepBodyBasic) {
  const listItemUpdate = (rID: number, sID: number, data: { text: string }) =>
    update({ recipeID: rID, stepID: sID, ...data })

  return (
    <ListItem
      id={id}
      recipeID={recipeID}
      text={text}
      update={listItemUpdate}
      updating={updating}
      removing={removing}
      delete={() => remove({ recipeID, stepID: id })}
    />
  )
}

const StepBody = connect(
  null,
  {
    update: updateStep.request,
    remove: deleteStep.request
  }
)(StepBodyBasic)

export default DropTarget(DragDrop.STEP, stepTarget, cnct => ({
  connectDropTarget: cnct.dropTarget()
}))(
  DragSource(DragDrop.STEP, stepSource, (cnct, monitor) => ({
    connectDragSource: cnct.dragSource(),
    connectDragPreview: cnct.dragPreview(),
    isDragging: monitor.isDragging()
  }))(Step)
)
