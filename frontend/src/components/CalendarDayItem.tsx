import React from "react"
import { Link } from "react-router-dom"
import { DragSource, ConnectDragSource } from "react-dnd"
import { beforeCurrentDay } from "@/date"
import { recipeURL } from "@/urls"
import { DragDrop } from "@/dragDrop"
import { IRecipe } from "@/store/reducers/recipes"
import { ICalRecipe } from "@/store/reducers/calendar"
import { TextInput } from "@/components/Forms"
import { isPast, endOfDay } from "date-fns"
import { Result, isOk } from "@/result"
import { useGlobalEvent } from "@/hooks"

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

function CalendarItem({
  connectDragSource,
  isDragging,
  ...props
}: ICalendarItemProps & ICollectedProps) {
  const [count, setCount] = React.useState(props.count)
  const [hover, setHover] = React.useState(false)

  React.useEffect(() => {
    setCount(props.count)
  }, [props.count])

  const updateCount = React.useCallback(
    (newCount: number) => {
      if (beforeCurrentDay(props.date)) {
        return
      }
      const oldCount = count
      setCount(newCount)
      props.updateCount(newCount).then(res => {
        if (isOk(res)) {
          props.refetchShoppingList()
        } else {
          setCount(oldCount)
        }
      })
    },
    [count]
  )

  const handleKeyPress = (e: KeyboardEvent) => {
    console.info(hover, count)
    if (!hover) {
      return
    }

    if (beforeCurrentDay(props.date)) {
      return
    }

    if (e.key === "#" || e.key === "Delete") {
      props.remove()
    }
    if (e.key === "A" || e.key === "+") {
      updateCount(count + 1)
    }
    if (e.key === "X" || e.key === "-") {
      updateCount(count - 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateCount(parseInt(e.target.value, 10))

  const handleMouseEnter = () => setHover(true)
  const handleMouseLeave = () => setHover(false)

  const style: React.CSSProperties = {
    visibility: isDragging && !isPast(props.date) ? "hidden" : "visible",
    backgroundColor: hover ? "red" : "black"
  }

  useGlobalEvent({ keyUp: handleKeyPress })

  return connectDragSource(
    <li
      className="d-flex align-items-center cursor-pointer justify-space-between mb-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}>
      <RecipeLink name={props.recipeName} id={props.recipeID} />
      <Count value={count} onChange={handleChange} />
    </li>
  )
}

export interface ICalendarDragItem
  extends Pick<ICalendarItemProps, "recipeID" | "count" | "id" | "date"> {
  readonly type: DragDrop.CAL_RECIPE
}

export default DragSource(
  DragDrop.CAL_RECIPE,
  {
    beginDrag(props: ICalendarItemProps): ICalendarDragItem {
      return {
        type: DragDrop.CAL_RECIPE,
        recipeID: props.recipeID,
        count: props.count,
        id: props.id,
        date: props.date
      }
    },
    endDrag(props, monitor) {
      // when dragged onto something that isn't a target, we remove it
      // but we don't remove when in past as we only copy from the past
      if (!monitor.didDrop() && !isPast(endOfDay(props.date))) {
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
