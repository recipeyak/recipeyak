import React from "react"
import { styled } from "@/theme"
import { Link } from "react-router-dom"
import { useDrag } from "react-dnd"
import { isInsideChangeWindow } from "@/date"
import { recipeURL } from "@/urls"
import { DragDrop } from "@/dragDrop"
import { IRecipe } from "@/store/reducers/recipes"
import { ICalRecipe } from "@/store/reducers/calendar"
import { TextInput } from "@/components/Forms"
import { Result, isOk } from "@/result"
import { useGlobalEvent } from "@/hooks"
import { CalendarDayItemModal } from "@/components/CalendarDayItemModal"

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
  readonly onClick: (e: React.MouseEvent) => void
}

const StyledLink = styled(Link)`
  line-height: 1.3;
  font-size: ${props => props.theme.text.small};
  word-break: break-word;
  background-color: ${props => props.theme.color.background};
  border-radius: 5px;
  padding: 0.35rem;
  font-weight: 600;
`

function RecipeLink({ name, id, onClick }: IRecipeLink) {
  const to = recipeURL(id, name)
  return (
    <StyledLink to={to} onClick={onClick}>
      {name}
    </StyledLink>
  )
}

interface ICalendarListItemProps {
  readonly visibility: React.CSSProperties["visibility"]
}

const CalendarListItem = styled.li<ICalendarListItemProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  visibility: ${props => props.visibility};
`

export interface ICalendarItemProps {
  readonly count: ICalRecipe["count"]
  readonly remove: () => void
  readonly updateCount: (
    count: ICalRecipe["count"],
  ) => Promise<Result<void, void>>
  readonly refetchShoppingList: () => void
  readonly date: Date
  readonly recipeID: IRecipe["id"] | string
  readonly recipeName: IRecipe["name"]
  readonly scheduledId: ICalRecipe["id"]
  readonly teamID: TeamID
}

export function CalendarItem({
  count: propsCount,
  updateCount: propsUpdateCount,
  date,
  refetchShoppingList,
  remove,
  recipeName,
  recipeID,
  teamID,
  scheduledId,
}: ICalendarItemProps) {
  const [count, setCount] = React.useState(propsCount)
  const ref = React.useRef<HTMLLIElement>(null)
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    setCount(propsCount)
  }, [propsCount])

  const updateCount = (newCount: number) => {
    if (!isInsideChangeWindow(date)) {
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
    if (!ref.current?.matches(":hover")) {
      return
    }

    if (!isInsideChangeWindow(date)) {
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

  const dragItem: ICalendarDragItem = {
    type: DragDrop.CAL_RECIPE,
    recipeID,
    count,
    scheduledId,
    date,
  }

  const [{ isDragging }, drag] = useDrag({
    item: dragItem,
    end: (_dropResult, monitor) => {
      // when dragged onto something that isn't a target, we remove it
      // but we don't remove when in past as we only copy from the past
      if (!monitor.didDrop() && isInsideChangeWindow(date)) {
        remove()
      }
    },
    collect: monitor => {
      return {
        isDragging: monitor.isDragging(),
      }
    },
  })

  const visibility =
    isDragging && isInsideChangeWindow(date) ? "hidden" : "visible"

  useGlobalEvent({ keyUp: handleKeyPress })

  drag(ref)

  return (
    <>
      <CalendarListItem ref={ref} visibility={visibility}>
        <RecipeLink
          name={recipeName}
          id={recipeID}
          onClick={e => {
            e.preventDefault()
            setShow(true)
          }}
        />
        <Count value={count} onChange={handleChange} />
      </CalendarListItem>
      {show ? (
        <CalendarDayItemModal
          scheduledId={scheduledId}
          teamID={teamID}
          recipeName={recipeName}
          recipeId={recipeID}
          date={date}
          onClose={() => setShow(false)}
        />
      ) : null}
    </>
  )
}

export interface ICalendarDragItem
  extends Pick<ICalendarItemProps, "recipeID" | "count" | "scheduledId" | "date"> {
  readonly type: DragDrop.CAL_RECIPE
}
