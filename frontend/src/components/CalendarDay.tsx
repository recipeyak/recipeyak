import React from "react"
import { connect } from "react-redux"
import format from "date-fns/format"
import { useDrop } from "react-dnd"
import isWithinRange from "date-fns/is_within_range"
import startOfDay from "date-fns/start_of_day"
import endOfDay from "date-fns/end_of_day"
import isFirstDayOfMonth from "date-fns/is_first_day_of_month"
import sortBy from "lodash/sortBy"

import { beforeCurrentDay } from "@/date"

import { classNames } from "@/classnames"

import { CalendarItem, ICalendarDragItem } from "@/components/CalendarDayItem"

import {
  updatingScheduledRecipeAsync,
  deletingScheduledRecipeAsync,
  Dispatch,
  fetchingShoppingListAsync,
  IAddingScheduledRecipeProps,
  IMoveScheduledRecipeProps
} from "@/store/thunks"

import { DragDrop } from "@/dragDrop"
import { IState } from "@/store/store"
import {
  ICalRecipe,
  moveOrCreateCalendarRecipe,
  createCalendarRecipe
} from "@/store/reducers/calendar"
import { IRecipeItemDrag } from "@/components/RecipeItem"
import { Result } from "@/result"
import { useCurrentDay } from "@/hooks"
import { isSameDay } from "date-fns"

function DayOfWeek({ date }: { date: Date }) {
  const dayOfWeek = format(date, "ddd")
  return (
    <div className="d-none d-medium-block">
      <span>{dayOfWeek}</span>
      <span className="mx-1">∙</span>
    </div>
  )
}

const Title = ({ date }: { date: Date }) => {
  const dateFmtText = isFirstDayOfMonth(date) ? "MMM D" : "D"
  return (
    <div className="d-flex">
      <DayOfWeek date={date} />
      <span>{format(date, dateFmtText)}</span>
    </div>
  )
}

interface ICalendarDayProps {
  readonly date: Date
  readonly scheduledRecipes: ICalRecipe[]
  readonly updateCount: (
    id: ICalRecipe["id"],
    teamID: TeamID,
    count: ICalRecipe["count"]
  ) => Promise<Result<void, void>>
  readonly refetchShoppingList: (teamID: TeamID) => void
  readonly remove: (id: ICalRecipe["id"], teamID: TeamID) => void
  readonly move: ({ id, teamID, to }: IMoveScheduledRecipeProps) => void
  readonly create: ({
    recipeID,
    teamID,
    on,
    count
  }: IAddingScheduledRecipeProps) => void
  readonly teamID: TeamID
  readonly isSelected: boolean
}

function CalendarDay({
  date,
  scheduledRecipes,
  updateCount,
  refetchShoppingList,
  remove,
  teamID,
  isSelected,
  move,
  create
}: ICalendarDayProps) {
  const today = useCurrentDay()
  const isToday = isSameDay(date, today)

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [DragDrop.RECIPE, DragDrop.CAL_RECIPE],
    canDrop: () => {
      // event when copying from past, we don't want to copy to past dates
      return !beforeCurrentDay(date)
    },
    drop: dropped => {
      const item = dropped as ICalendarDragItem | IRecipeItemDrag
      // TOOD(sbdchd): We should move this logic into the calendar reducer
      if (item.type === DragDrop.CAL_RECIPE) {
        move({ id: item.id, teamID, to: date })
      } else if (item.type === DragDrop.RECIPE) {
        create({ recipeID: item.recipeID, teamID, on: date, count: 1 })
      }
    },
    collect: monitor => {
      return {
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      }
    }
  })

  const scheduled = sortBy(scheduledRecipes, x => new Date(x.created))

  return (
    <div
      ref={drop}
      style={{
        opacity: isOver && canDrop ? 0.5 : 1
      }}
      className={classNames("calendar-day", "p-1", "flex-grow-1", {
        "current-day": isToday,
        "selected-day": isSelected || (isOver && canDrop)
      })}>
      <Title date={date} />
      <ul>
        {scheduled.map(x => (
          <CalendarItem
            key={x.id}
            id={x.id}
            date={date}
            recipeName={x.recipe.name}
            recipeID={x.recipe.id}
            remove={() => remove(x.id, teamID)}
            updateCount={count => updateCount(x.id, teamID, count)}
            refetchShoppingList={() => refetchShoppingList(teamID)}
            count={x.count}
          />
        ))}
      </ul>
    </div>
  )
}

function mapStateToProps(
  state: IState,
  props: Pick<ICalendarDayProps, "date">
) {
  const isShopping =
    state.router.location != null
      ? state.router.location.pathname.includes("shopping")
      : false
  return {
    isSelected:
      isWithinRange(
        props.date,
        startOfDay(state.shoppinglist.startDay),
        endOfDay(state.shoppinglist.endDay)
      ) && isShopping
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch
): Pick<
  ICalendarDayProps,
  "create" | "updateCount" | "refetchShoppingList" | "move" | "remove"
> => ({
  create: (props: IAddingScheduledRecipeProps) =>
    dispatch(createCalendarRecipe(props)),
  updateCount: updatingScheduledRecipeAsync(dispatch),
  refetchShoppingList: fetchingShoppingListAsync(dispatch),
  move: (props: IMoveScheduledRecipeProps) =>
    dispatch(moveOrCreateCalendarRecipe(props)),
  remove: deletingScheduledRecipeAsync(dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CalendarDay)
