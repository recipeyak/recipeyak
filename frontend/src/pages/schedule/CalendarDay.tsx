import { isSameDay, parseISO } from "date-fns"
import endOfDay from "date-fns/endOfDay"
import format from "date-fns/format"
import isFirstDayOfMonth from "date-fns/isFirstDayOfMonth"
import isWithinInterval from "date-fns/isWithinInterval"
import startOfDay from "date-fns/startOfDay"
import { sortBy } from "lodash-es"
import { useState } from "react"
import { useDrop } from "react-dnd"
import { useLocation } from "react-router"

import { assertNever } from "@/assert"
import { clx } from "@/classnames"
import { isInsideChangeWindow, toISODateString } from "@/date"
import { DragDrop } from "@/dragDrop"
import {
  CalendarItem,
  ICalendarDragItem,
} from "@/pages/schedule/CalendarDayItem"
import { ScheduleRecipeModal } from "@/pages/schedule/ScheduleRecipeModal"
import {
  ScheduledRecipe,
  useScheduleRecipeCreate,
} from "@/queries/scheduledRecipeCreate"
import { useScheduledRecipeDelete } from "@/queries/scheduledRecipeDelete"
import { useScheduledRecipeUpdate } from "@/queries/scheduledRecipeUpdate"
import { useCurrentDay } from "@/useCurrentDay"

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

export function CalendarDay({
  date,
  scheduledRecipes,
}: {
  readonly date: Date
  readonly scheduledRecipes: ScheduledRecipe[]
}) {
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

  const scheduledRecipeDelete = useScheduledRecipeDelete()
  const scheduledRecipeUpdate = useScheduledRecipeUpdate()

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [DragDrop.CAL_RECIPE],
    canDrop: () => {
      return isInsideChangeWindow(date)
    },
    drop: (dropped) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const item = dropped as ICalendarDragItem
      if (item.type === DragDrop.CAL_RECIPE) {
        scheduledRecipeUpdate.mutate({
          scheduledRecipeId: item.scheduledId,
          update: {
            on: toISODateString(date),
          },
        })
      } else {
        assertNever(item.type)
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
  const [showScheduleRecipeModal, setShowScheduleRecipeModal] = useState(false)
  const scheduledRecipeCreate = useScheduleRecipeCreate()

  return (
    <div
      ref={drop}
      onDoubleClick={() => {
        setShowScheduleRecipeModal(true)
      }}
      onDrop={(e) => {
        const recipe = e.dataTransfer.getData("recipeyak/recipe")
        if (recipe) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsedRecipe: { id: number; name: string } = JSON.parse(recipe)
          scheduledRecipeCreate.mutate({
            recipeID: parsedRecipe.id,
            on: date,
            recipeName: parsedRecipe.name,
          })
        }
      }}
      className={clx(
        "flex shrink-0 grow basis-0 flex-col border-2 border-solid border-transparent bg-[var(--color-background-calendar-day)] p-1 transition-[background-color,border] duration-200 [word-break:break-word]",
        isDroppable && "opacity-50",
        isSelectedDay &&
          // Could avoid the important here if we were using stylex
          "rounded-md border-2 border-solid !border-[var(--color-border-selected-day)]",
        isToday && "border-b-2 border-solid border-b-[var(--color-accent)]",
      )}
    >
      <Title date={date} />
      <ScheduleRecipeModal
        isOpen={showScheduleRecipeModal}
        onOpenChange={() => {
          setShowScheduleRecipeModal(false)
        }}
        defaultValue={toISODateString(date)}
      />
      <ul className="flex h-full flex-col gap-3 overflow-y-auto px-1">
        {scheduled.map((x) => (
          <CalendarItem
            key={x.id}
            scheduledId={x.id}
            createdAt={x.created}
            createdBy={x.createdBy}
            date={date}
            recipeName={x.recipe.name}
            recipeAuthor={x.recipe.author}
            recipeID={x.recipe.id}
            primaryImage={x.recipe.primaryImage}
            remove={() => {
              scheduledRecipeDelete.mutate({
                scheduledRecipeId: x.id,
              })
            }}
          />
        ))}
      </ul>
    </div>
  )
}
