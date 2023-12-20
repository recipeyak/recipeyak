import { isSameDay, parseISO } from "date-fns"
import endOfDay from "date-fns/endOfDay"
import format from "date-fns/format"
import isFirstDayOfMonth from "date-fns/isFirstDayOfMonth"
import isWithinInterval from "date-fns/isWithinInterval"
import startOfDay from "date-fns/startOfDay"
import { sortBy } from "lodash-es"
import { useDrop } from "react-dnd"
import { useLocation } from "react-router"

import { assertNever } from "@/assert"
import { clx } from "@/classnames"
import { isInsideChangeWindow, toISODateString } from "@/date"
import { DragDrop } from "@/dragDrop"
import { IRecipeItemDrag } from "@/pages/recipe-list/RecipeItem"
import {
  CalendarItem,
  ICalendarDragItem,
} from "@/pages/schedule/CalendarDayItem"
import {
  ICalRecipe,
  useScheduleRecipeCreate,
} from "@/queries/scheduledRecipeCreate"
import { useScheduledRecipeDelete } from "@/queries/scheduledRecipeDelete"
import { useScheduledRecipeUpdate } from "@/queries/scheduledRecipeUpdate"
import { useCurrentDay } from "@/useCurrentDay"
import { useTeamId } from "@/useTeamId"

function DayOfWeek({ date }: { date: Date }) {
  const dayOfWeek = format(date, "E")
  return (
    <div className="block md:hidden">
      <span>{dayOfWeek}</span>
      <span className="mx-1">∙</span>
    </div>
  )
}

const Title = ({ date }: { readonly date: Date }) => {
  const dateFmtText = isFirstDayOfMonth(date) ? "MMM d" : "d"
  return (
    <div className="flex text-[14px]">
      <DayOfWeek date={date} />
      <span>{format(date, dateFmtText)}</span>
    </div>
  )
}

interface ICalendarDayProps {
  readonly date: Date
  readonly scheduledRecipes: ICalRecipe[]
  readonly className?: string
}

function CalendarDay({ date, scheduledRecipes, className }: ICalendarDayProps) {
  const today = useCurrentDay()
  const isToday = isSameDay(date, today)
  const teamID = useTeamId()

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
    <div
      ref={drop}
      className={clx(
        className,
        "flex-col border-2 border-solid border-transparent bg-[var(--color-background-calendar-day)] p-1",
        isToday && "border-b-[var(--color-accent)]",
        isSelectedDay && "rounded-md border-[var(--color-border-selected-day)]",
        isDroppable && "opacity-50",
      )}
    >
      <Title date={date} />
      <ul className="h-full overflow-y-auto">
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
    </div>
  )
}

export default CalendarDay
