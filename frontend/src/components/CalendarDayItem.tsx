import React from "react"

import { Link } from "react-router-dom"
import { DragSource, ConnectDragSource } from "react-dnd"

import { beforeCurrentDay } from "@/date"

import { recipeURL } from "@/urls"

import * as DragDrop from "@/dragDrop"
import { IRecipe } from "@/store/reducers/recipes"
import { ICalRecipe } from "@/store/reducers/calendar"
import { AxiosResponse } from "axios"
import GlobalEvent from "@/components/GlobalEvent"
import { TextInput } from "@/components/Forms"

const COUNT_THRESHOLD = 1

interface ICollectedProps {
  readonly connectDragSource: ConnectDragSource

  readonly isDragging: boolean
}

interface ICalendarItemProps {
  readonly count: ICalRecipe["count"]
  readonly remove: () => void
  readonly updateCount: (
    count: ICalRecipe["count"]
  ) => Promise<void | AxiosResponse<void>>
  readonly refetchShoppingList: () => void
  readonly date: Date
  readonly recipeID: IRecipe["id"] | string
  readonly recipeName: IRecipe["name"]
  readonly id: ICalRecipe["id"]
}

interface ICalendarItemState {
  readonly hover: boolean
  readonly count: number
}

class CalendarItem extends React.Component<
  ICalendarItemProps & ICollectedProps,
  ICalendarItemState
> {
  state: ICalendarItemState = {
    count: this.props.count,
    hover: false
  }

  componentWillMount() {
    this.setState({ count: this.props.count })
  }

  componentWillReceiveProps(nextProps: ICalendarItemProps) {
    this.setState({ count: nextProps.count })
  }

  handleKeyPress = (e: KeyboardEvent) => {
    if (!this.state.hover) {
      return
    }

    if (beforeCurrentDay(this.props.date)) {
      return
    }

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

  updateCount = (count: number) => {
    const oldCount = this.state.count
    if (beforeCurrentDay(this.props.date)) {
      return
    }
    this.setState({ count })
    this.props
      .updateCount(count)
      .then(() => this.props.refetchShoppingList())
      .catch(() => this.setState({ count: oldCount }))
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10)
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
        <GlobalEvent keyUp={this.handleKeyPress} />
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
            <TextInput
              className="fs-3 text-right w-2rem"
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

export default DragSource(
  DragDrop.RECIPE,
  {
    beginDrag(props: ICalendarItemProps) {
      return {
        recipeID: props.recipeID,
        count: props.count,
        id: props.id
      }
    },
    canDrag({ date }: ICalendarItemProps) {
      return !beforeCurrentDay(date)
    },
    endDrag(props, monitor) {
      // when dragged onto something that isn't a target, we remove it
      if (!monitor.didDrop()) {
        props.remove()
      }
    }
  },
  (connect, monitor) => {
    return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging()
    }
  }
)(CalendarItem)
