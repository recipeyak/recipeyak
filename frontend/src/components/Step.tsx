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
import * as ItemTypes from "@/dragDrop"
import ListItem from "@/components/ListItem"

import { deletingStep, updatingStep, Dispatch } from "@/store/thunks"
import { IStep, IRecipe } from "@/store/reducers/recipes"

const style = {
  backgroundColor: "white"
}

const cardSource = {
  beginDrag(props: ICardProps) {
    return {
      id: props.id,
      index: props.index,
      position: props.position
    }
  },
  endDrag(props: ICardProps) {
    props.completeMove(props.id, props.index)
  }
}

const cardTarget = {
  hover(props: ICardProps, monitor: DropTargetMonitor, component: Card) {
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
    props.moveCard(dragIndex, hoverIndex)

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

interface ICardProps {
  readonly index: number
  readonly id: number
  readonly recipeID: IRecipe["id"]
  readonly text: string
  readonly moveCard: (dragIndex: number, hoverIndex: number) => void
  readonly completeMove: (dragIndex: number, hoverIndex: number) => void
  readonly updating?: boolean
  readonly removing?: boolean
  readonly position?: number
}

class Card extends React.Component<ICardProps & ICollectedProps, {}> {
  static defaultProps = {
    updating: false,
    removing: false
  }

  render() {
    const {
      text,
      isDragging,
      connectDragSource,
      connectDropTarget,
      connectDragPreview,
      index
    } = this.props
    const opacity = isDragging ? 0 : 1

    return connectDragPreview(
      connectDropTarget(
        <div style={{ ...style, opacity }}>
          {connectDragSource(
            <label className="better-label" style={{ cursor: "move" }}>
              Step {index + 1}
            </label>
          )}
          <StepBody
            id={this.props.id}
            recipeID={this.props.recipeID}
            updating={this.props.updating}
            removing={this.props.removing}
            text={text}
          />
        </div>
      )
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  update: updatingStep(dispatch),
  delete: deletingStep(dispatch)
})

interface IStepBodyBasic {
  readonly id: IStep["id"]
  readonly recipeID: IRecipe["id"]
  readonly text: IStep["text"]
  readonly updating?: boolean
  readonly removing?: boolean
  readonly update: (
    recipeID: number,
    stepID: number,
    step: { text?: string }
  ) => Promise<void>
  readonly delete: (recipeID: IRecipe["id"], id: number) => Promise<void>
}

function StepBodyBasic(props: IStepBodyBasic) {
  return (
    <ListItem
      id={props.id}
      recipeID={props.recipeID}
      text={props.text}
      update={props.update}
      updating={props.updating}
      removing={props.removing}
      delete={() => props.delete(props.recipeID, props.id)}
    />
  )
}
const StepBody = connect(
  null,
  mapDispatchToProps
)(StepBodyBasic)

export default DropTarget(ItemTypes.CARD, cardTarget, cnct => ({
  connectDropTarget: cnct.dropTarget()
}))(
  DragSource(ItemTypes.CARD, cardSource, (cnct, monitor) => ({
    connectDragSource: cnct.dragSource(),
    connectDragPreview: cnct.dragPreview(),
    isDragging: monitor.isDragging()
  }))(Card)
)
