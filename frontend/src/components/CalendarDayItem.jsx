import React from 'react'
import { Link } from 'react-router-dom'
import { DragSource } from 'react-dnd'

import { recipeURL } from '../urls'

import * as DragDrop from '../dragDrop'

const recipeSource = {
  beginDrag (props) {
    return {
      recipeID: props.recipeID,
      count: props.count,
      date: props.date,
    }
  },
  endDrag (props, monitor, component) {
    if (monitor.didDrop()) {
      props.updateCount(0)
    }
  }
}

function collect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

@DragSource(DragDrop.RECIPE, recipeSource, collect)
class CalendarItem extends React.Component {
  state = {
    count: this.props.count
  }

  componentWillMount () {
    this.setState({ count: this.props.count })
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ count: nextProps.count })
  }

  handleChange = e => {
    const count = e.target.value
    const oldCount = this.state.count
    this.setState({ count })
    this.props.updateCount(count)
      .then(() => this.props.refetchShoppingList())
      .catch(() => this.setState({ count: oldCount }))
  }

  render () {
    const { connectDragSource, isDragging } = this.props
    return connectDragSource(
      <div className="d-flex align-items-center cursor-pointer justify-space-between mb-1"
        style={{
            visibility: isDragging ? 'hidden' : 'visible',
        }}>
        <Link
          to={recipeURL(this.props.recipeID, this.props.recipeName)}
          className="break-word fs-3"
          style={{
            lineHeight: 1.1,
          }}>
          { this.props.recipeName }
        </Link>
        <div className="d-flex">
          <input
            className="fs-3 my-input text-right w-2rem"
            onChange={ this.handleChange }
            value={ this.state.count } />
        </div>
      </div>)
  }
}

export default CalendarItem
