import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { DragSource } from "react-dnd"

import { beforeCurrentDay } from "../date"

import { recipeURL } from "../urls"

import * as DragDrop from "../dragDrop"

const COUNT_THRESHOLD = 1

const source = {
  beginDrag(props) {
    return {
      recipeID: props.recipeID,
      count: props.count,
      id: props.id
    }
  },
  canDrag({ date }) {
    return !beforeCurrentDay(date)
  },
  endDrag(props, monitor) {
    // when dragged onto something that isn't a target, we remove it
    if (!monitor.didDrop()) {
      props.remove()
    }
  }
}

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

@DragSource(DragDrop.RECIPE, source, collect)
export default class CalendarItem extends React.Component {
  state = {
    count: this.props.count,
    hover: false
  }

  static propTypes = {
    id: PropTypes.number.isRequired,
    recipeID: PropTypes.number.isRequired,
    recipeName: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    remove: PropTypes.func.isRequired,
    updateCount: PropTypes.func.isRequired,
    refetchShoppingList: PropTypes.func.isRequired,
    date: PropTypes.object.isRequired
  }

  componentWillMount() {
    this.setState({ count: this.props.count })
    document.addEventListener("keypress", this.handleKeyPress)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ count: nextProps.count })
  }

  componentWillUnmount() {
    document.removeEventListener("keypress", this.handleKeyPress)
  }

  handleKeyPress = e => {
    if (!this.state.hover) return

    if (beforeCurrentDay(this.props.date)) return

    if (e.key === "#") {
      this.props.remove()
    }
    if (e.key === "A") {
      this.updateCount(this.state.count + 1)
    }
    if (e.key === "X") {
      this.updateCount(this.state.count - 1)
    }
  }

  updateCount = count => {
    const oldCount = this.state.count
    if (beforeCurrentDay(this.props.date)) return
    this.setState({ count })
    this.props
      .updateCount(count)
      .then(() => this.props.refetchShoppingList())
      .catch(() => this.setState({ count: oldCount }))
  }

  handleChange = e => {
    const count = e.target.value
    this.updateCount(count)
  }

  render() {
    const { connectDragSource, isDragging } = this.props
    return connectDragSource(
      <div
        className="d-flex align-items-center cursor-pointer justify-space-between mb-1"
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        style={{
          visibility: isDragging ? "hidden" : "visible"
        }}>
        <Link
          to={recipeURL(this.props.recipeID, this.props.recipeName)}
          className="break-word fs-3"
          style={{
            lineHeight: 1.1
          }}>
          {this.props.recipeName}
        </Link>
        {this.state.count > COUNT_THRESHOLD ? (
          <div className="d-flex">
            <input
              className="fs-3 my-input text-right w-2rem"
              name="calendar-item-count"
              onChange={this.handleChange}
              value={this.state.count}
            />
          </div>
        ) : null}
      </div>
    )
  }
}
