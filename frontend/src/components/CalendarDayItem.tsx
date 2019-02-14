import React from "react"
import { Link } from "react-router-dom"
import { DragSource, ConnectDragSource } from "react-dnd"
import { beforeCurrentDay } from "@/date"
import { recipeURL } from "@/urls"
import * as DragDrop from "@/dragDrop"
import { IRecipe } from "@/store/reducers/recipes"
import { ICalRecipe } from "@/store/reducers/calendar"
import GlobalEvent from "@/components/GlobalEvent"
import { TextInput } from "@/components/Forms"
import { isPast } from "date-fns"
import { Result, isOk } from "@/result"

const COUNT_THRESHOLD = 1

interface ICountProps {
  readonly value: number
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
function Count({ value: count, onChange }: ICountProps) {
  if (count > COUNT_THRESHOLD) {
    return (
      <div className="d-flex">
        <TextInput
          className="text-small text-right w-2rem"
          name="calendar-item-count"
          onChange={onChange}
          value={count}
        />
      </div>
    )
  }
  return null
}

interface IRecipeLink {
  readonly id: IRecipe["id"] | string
  readonly name: IRecipe["name"]
}
function RecipeLink({ name, id }: IRecipeLink) {
  return (
    <Link
      to={recipeURL(id, name)}
      className="break-word text-small"
      style={{
        lineHeight: 1.1
      }}>
      {name}
    </Link>
  )
}

interface ICollectedProps {
  readonly connectDragSource: ConnectDragSource
  readonly isDragging: boolean
}

export interface ICalendarItemProps {
  readonly count: ICalRecipe["count"]
  readonly remove: () => void
  readonly updateCount: (
    count: ICalRecipe["count"]
  ) => Promise<Result<void, void>>
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
    this.props.updateCount(count).then(res => {
      if (isOk(res)) {
        this.props.refetchShoppingList()
      } else {
        this.setState({ count: oldCount })
      }
    })
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10)
    this.updateCount(count)
  }

  handleMouseEnter = () => this.setState({ hover: true })
  handleMouseLeave = () => this.setState({ hover: false })

  render() {
    const { connectDragSource, isDragging } = this.props

    const style: React.CSSProperties = {
      visibility: isDragging && !isPast(this.props.date) ? "hidden" : "visible"
    }
    return connectDragSource(
      <li
        className="d-flex align-items-center cursor-pointer justify-space-between mb-1"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={style}>
        <GlobalEvent keyUp={this.handleKeyPress} />
        <RecipeLink name={this.props.recipeName} id={this.props.recipeID} />
        <Count value={this.state.count} onChange={this.handleChange} />
      </li>
    )
  }
}

export interface ICalendarDragItem
  extends Pick<ICalendarItemProps, "recipeID" | "count" | "id" | "date"> {
  readonly kind: typeof DragDrop.CAL_RECIPE
}

export default DragSource(
  DragDrop.CAL_RECIPE,
  {
    beginDrag(props: ICalendarItemProps): ICalendarDragItem {
      return {
        kind: DragDrop.CAL_RECIPE,
        recipeID: props.recipeID,
        count: props.count,
        id: props.id,
        date: props.date
      }
    },
    endDrag(props, monitor) {
      // when dragged onto something that isn't a target, we remove it
      // but we don't remove when in past as we only copy from the past
      if (!monitor.didDrop() && !isPast(props.date)) {
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
