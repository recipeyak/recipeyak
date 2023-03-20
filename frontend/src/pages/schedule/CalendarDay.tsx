import { isSameDay, parseISO } from "date-fns"
import endOfDay from "date-fns/endOfDay"
import format from "date-fns/format"
import isFirstDayOfMonth from "date-fns/isFirstDayOfMonth"
import isWithinInterval from "date-fns/isWithinInterval"
import startOfDay from "date-fns/startOfDay"
import { sortBy } from "lodash-es"
import { useDrop } from "react-dnd"
import { useLocation } from "react-router"

import { ICalRecipe } from "@/api"
import { assertNever } from "@/assert"
import { isInsideChangeWindow, toISODateString } from "@/date"
import { DragDrop } from "@/dragDrop"
import { useCurrentDay } from "@/hooks"
import { IRecipeItemDrag } from "@/pages/recipe-list/RecipeItem"
import {
  CalendarItem,
  ICalendarDragItem,
} from "@/pages/schedule/CalendarDayItem"
import { useScheduleRecipeCreate } from "@/queries/scheduledRecipeCreate"
import { useScheduledRecipeDelete } from "@/queries/scheduledRecipeDelete"
import { useScheduledRecipeUpdate } from "@/queries/scheduledRecipeUpdate"
import { css, styled } from "@/theme"

function DayOfWeek({ date }: { date: Date }) {
  const dayOfWeek = format(date, "E")
  return (
    <div className="d-none d-medium-block">
      <span>{dayOfWeek}</span>
      <span className="mx-1">∙</span>
    </div>
  )
}

const Title = ({ date }: { readonly date: Date }) => {
  const dateFmtText = isFirstDayOfMonth(date) ? "MMM d" : "d"
  return (
    <div className="d-flex fs-14px">
      <DayOfWeek date={date} />
      <span>{format(date, dateFmtText)}</span>
    </div>
  )
}

const isTodayStyle = css`
  border-bottom: 2px solid var(--color-accent);
`

const isSelectedDayStyle = css`
  border: 2px solid var(--color-accent);
  border-radius: 6px;
`

const isDroppableStyle = css`
  opacity: 0.5;
`

interface ICalendarDayContainerProps {
  readonly isToday: boolean
  readonly isSelectedDay: boolean
  readonly isDroppable: boolean
}

const CalendarDayContainer = styled.div<ICalendarDayContainerProps>`
  flex: 1 1 0%;
  padding: 0.25rem;
  background-color: var(--color-background-calendar-day);
  transition: background-color 0.2s;
  // prevent shifting when we show the highlight border
  border: 2px solid transparent;

  ${(p) => p.isToday && isTodayStyle}
  ${(p) => p.isSelectedDay && isSelectedDayStyle}
  ${(p) => p.isDroppable && isDroppableStyle}

  &:not(:last-child) {
    margin-right: 0.25rem;
    @media (max-width: ${(p) => p.theme.medium}) {
      margin-right: 0;
      margin-bottom: 0.25rem;
    }
  }
  @media (max-width: ${(p) => p.theme.medium}) {
    width: 100%;
  }
`

interface ICalendarDayProps {
  readonly date: Date
  readonly scheduledRecipes: ICalRecipe[]
  readonly teamID: number
}

function CalendarDay({ date, scheduledRecipes, teamID }: ICalendarDayProps) {
  const today = useCurrentDay()
  const isToday = isSameDay(date, today)

  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const start = params.get("shoppingStartDay")
  const startParsed = start != null ? parseISO(start) : null
  const end = params.get("shoppingEndDay")
  const endParsed = end != null ? parseISO(end) : null
  const isSelected =
    startParsed != null &&
    endParsed != null &&
    isWithinInterval(date, {
      start: startOfDay(startParsed),
      end: endOfDay(endParsed),
    })

  const scheduledRecipeCreate = useScheduleRecipeCreate()
  const scheduledRecipeDelete = useScheduledRecipeDelete()
  const scheduledRecipeUpdate = useScheduledRecipeUpdate()

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [DragDrop.RECIPE, DragDrop.CAL_RECIPE],
    canDrop: () => {
      return isInsideChangeWindow(date)
    },
    drop: (dropped) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const item = dropped as ICalendarDragItem | IRecipeItemDrag
      if (item.type === DragDrop.CAL_RECIPE) {
        scheduledRecipeUpdate.mutate({
          scheduledRecipeId: item.scheduledId,
          teamID,
          update: {
            on: toISODateString(date),
          },
        })
      } else if (item.type === DragDrop.RECIPE) {
        scheduledRecipeCreate.mutate({
          recipeID: item.recipeID,
          recipeName: item.recipeName,
          teamID,
          on: date,
        })
      } else {
        assertNever(item)
      }
    },
    collect: (monitor) => {
      return {
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }
    },
  })

  const scheduled = sortBy(scheduledRecipes, (x) => new Date(x.created))

  const isDroppable = isOver && canDrop

  const isSelectedDay = isSelected || isDroppable

  return (
    <CalendarDayContainer
      ref={drop}
      isDroppable={isDroppable}
      isToday={isToday}
      isSelectedDay={isSelectedDay}
    >
      <Title date={date} />
      <ul>
        {scheduled.map((x) => (
          <CalendarItem
            key={x.id}
            scheduledId={x.id}
            createdAt={x.created}
            createdBy={x.createdBy}
            date={date}
            recipeName={x.recipe.name}
            recipeID={x.recipe.id}
            teamID={teamID}
            remove={() => {
              scheduledRecipeDelete.mutate({
                scheduledRecipeId: x.id,
                teamId: teamID,
              })
            }}
          />
        ))}
      </ul>
    </CalendarDayContainer>
  )
}

export default CalendarDay
