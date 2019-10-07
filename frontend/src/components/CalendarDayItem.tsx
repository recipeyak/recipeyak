import React from "react"
import { styled } from "@/theme"
import { Link } from "react-router-dom"
import { useDrag } from "react-dnd"
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

const StyledLink = styled(Link)`
  line-height: 1.3;
  font-size: ${props => props.theme.text.small};
  word-break: break-word;
  background-color: ${props => props.theme.color.primary};
  border-radius: 5px;
  padding: 0.35rem;
  color: ${props => props.theme.color.white};
  font-weight: 600;
  :hover {
    color: ${props => props.theme.color.white};
  }
`

function RecipeLink({ name, id }: IRecipeLink) {
  const to = recipeURL(id, name)
  return <StyledLink to={to}>{name}</StyledLink>
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

export function CalendarItem({
  count: propsCount,
  updateCount: propsUpdateCount,
  date,
  refetchShoppingList,
  remove,
  recipeName,
  recipeID,
  id
}: ICalendarItemProps) {
  const [count, setCount] = React.useState(propsCount)
  const [hover, setHover] = React.useState(false)

  React.useEffect(() => {
    setCount(propsCount)
  }, [propsCount])

  const updateCount = (newCount: number) => {
    if (beforeCurrentDay(date)) {
      return
    }
    const oldCount = count
    setCount(newCount)
    propsUpdateCount(newCount).then(res => {
      if (isOk(res)) {
        refetchShoppingList()
      } else {
        setCount(oldCount)
      }
    })
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!hover) {
      return
    }

    if (beforeCurrentDay(date)) {
      return
    }

    if (e.key === "#" || e.key === "Delete") {
      remove()
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

  const dragItem: ICalendarDragItem = {
    type: DragDrop.CAL_RECIPE,
    recipeID,
    count,
    id,
    date
  }

  const [{ isDragging }, drag] = useDrag({
    item: dragItem,
    end: (_dropResult, monitor) => {
      // when dragged onto something that isn't a target, we remove it
      // but we don't remove when in past as we only copy from the past
      if (!monitor.didDrop() && !isPast(endOfDay(date))) {
        remove()
      }
    },
    collect: monitor => {
      return {
        isDragging: monitor.isDragging()
      }
    }
  })

  const style: React.CSSProperties = {
    visibility: isDragging && !isPast(date) ? "hidden" : "visible"
  }

  useGlobalEvent({ keyUp: handleKeyPress })

  return (
    <li
      ref={drag}
      className="d-flex align-items-center cursor-pointer justify-space-between mb-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}>
      <RecipeLink name={recipeName} id={recipeID} />
      <Count value={count} onChange={handleChange} />
    </li>
  )
}

export interface ICalendarDragItem
  extends Pick<ICalendarItemProps, "recipeID" | "count" | "id" | "date"> {
  readonly type: DragDrop.CAL_RECIPE
}
