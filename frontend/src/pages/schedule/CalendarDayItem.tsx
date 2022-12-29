import React from "react"
import { useDrag } from "react-dnd"
import { Link } from "react-router-dom"

import { isInsideChangeWindow } from "@/date"
import { DragDrop } from "@/dragDrop"
import { useGlobalEvent, useToggle } from "@/hooks"
import { CalendarDayItemModal } from "@/pages/schedule/CalendarDayItemModal"
import { IRecipe } from "@/api"
import { styled } from "@/theme"
import { recipeURL } from "@/urls"

interface IRecipeLink {
  readonly id: IRecipe["id"] | string
  readonly name: IRecipe["name"]
  readonly onClick: (e: React.MouseEvent) => void
}

const StyledLink = styled(Link)`
  line-height: 1.3;
  font-size: ${(props) => props.theme.text.small};
  word-break: break-word;
  background-color: ${(props) => props.theme.color.background};
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
  visibility: ${(props) => props.visibility};
`

export interface ICalendarItemProps {
  readonly remove: () => void
  readonly date: Date
  readonly recipeID: number | string
  readonly recipeName: string
  readonly scheduledId: number
  readonly teamID: number | "personal"
  readonly createdAt: string
  readonly createdBy: {
    readonly id: number | string
    readonly name: string
    readonly avatar_url: string
  } | null
}

export function CalendarItem({
  date,
  remove,
  recipeName,
  recipeID,
  teamID,
  scheduledId,
  createdAt,
  createdBy,
}: ICalendarItemProps) {
  const ref = React.useRef<HTMLLIElement>(null)
  const [show, toggleShow] = useToggle()

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
  }

  const dragItem: ICalendarDragItem = {
    type: DragDrop.CAL_RECIPE,
    recipeID,
    scheduledId,
    date,
  }

  const [{ isDragging }, drag] = useDrag({
    type: DragDrop.CAL_RECIPE,
    item: dragItem,
    // don't do anything when on drop
    end: () => {},
    collect: (monitor) => {
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
          onClick={(e) => {
            if (e.shiftKey || e.metaKey) {
              return
            }
            e.preventDefault()
            toggleShow()
          }}
        />
      </CalendarListItem>
      {show ? (
        <CalendarDayItemModal
          scheduledId={scheduledId}
          createdAt={createdAt}
          createdBy={createdBy}
          teamID={teamID}
          recipeName={recipeName}
          recipeId={recipeID}
          date={date}
          onClose={toggleShow}
        />
      ) : null}
    </>
  )
}

export interface ICalendarDragItem
  extends Pick<ICalendarItemProps, "recipeID" | "scheduledId" | "date"> {
  readonly type: DragDrop.CAL_RECIPE
}
