import { isSameDay, parseISO } from "date-fns"
import endOfDay from "date-fns/endOfDay"
import format from "date-fns/format"
import isFirstDayOfMonth from "date-fns/isFirstDayOfMonth"
import isWithinInterval from "date-fns/isWithinInterval"
import startOfDay from "date-fns/startOfDay"
import { sortBy } from "lodash-es"
import { useRef, useState } from "react"
import { mergeProps, useDrop } from "react-aria"
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

  const ref = useRef<HTMLDivElement>(null)
  const { dropProps, isDropTarget: isOver } = useDrop({
    ref,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async onDrop(e) {
      const dropItem = e.items[0]
      const data =
        dropItem.kind === "text"
          ? await dropItem.getText("recipeyak/scheduled-recipe")
          : ""
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const item = JSON.parse(data) as ICalendarDragItem
      if (item.type === DragDrop.CAL_RECIPE) {
        if (isDroppable) {
          scheduledRecipeUpdate.mutate({
            scheduledRecipeId: item.scheduledId,
            update: {
              on: toISODateString(date),
            },
          })
        }
      } else {
        assertNever(item.type)
      }
    },
  })

  const scheduled = sortBy(scheduledRecipes, (x) => new Date(x.created))

  const isDroppable = isOver && isInsideChangeWindow(date)

  const isSelectedDay = isSelected || isDroppable
  const [showScheduleRecipeModal, setShowScheduleRecipeModal] = useState(false)
  const scheduledRecipeCreate = useScheduleRecipeCreate()

  const dropCreateProps = {
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      if (e.dataTransfer.types.includes("recipeyak/recipe")) {
        e.dataTransfer.dropEffect = "copy"
      }
    },
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
      const recipe = e.dataTransfer.getData("recipeyak/recipe")
      if (recipe) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsedRecipe: { id: number; name: string } = JSON.parse(recipe)
        scheduledRecipeCreate.mutate({
          recipeID: parsedRecipe.id,
          on: date,
          recipeName: parsedRecipe.name,
        })
        return
      }
    },
  }

  return (
    <div
      {...mergeProps(dropProps, dropCreateProps)}
      ref={ref}
      onDoubleClick={() => {
        setShowScheduleRecipeModal(true)
      }}
      className={clx(
        "flex shrink-0 grow basis-0 flex-col border-2 border-solid border-transparent bg-[--color-background-calendar-day] p-1 transition-[background-color,border] duration-75 [word-break:break-word]",
        isSelectedDay &&
          // Could avoid the important here if we were using stylex
          "rounded-md border-2 border-solid !border-[--color-border-selected-day]",
        isToday && "border-b-2 border-solid border-b-[--color-accent]",
      )}
    >
      <Title date={date} />
      <ScheduleRecipeModal
        key={showScheduleRecipeModal.toString()}
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
            archived={x.recipe.archivedAt != null}
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
