import React from "react"
import { connect } from "react-redux"
import format from "date-fns/format"
import isToday from "date-fns/is_today"
import { DropTarget, ConnectDropTarget, DropTargetMonitor } from "react-dnd"
import isWithinRange from "date-fns/is_within_range"
import startOfDay from "date-fns/start_of_day"
import endOfDay from "date-fns/end_of_day"
import isFirstDayOfMonth from "date-fns/is_first_day_of_month"

import { beforeCurrentDay } from "@/date"

import { classNames } from "@/classnames"

import CalendarItem, { ICalendarDragItem } from "@/components/CalendarDayItem"

import {
  addingScheduledRecipe,
  updatingScheduledRecipe,
  moveScheduledRecipe,
  deletingScheduledRecipe,
  Dispatch,
  fetchingShoppingList
} from "@/store/thunks"

import { DragDrop } from "@/dragDrop"
import { IRecipe } from "@/store/reducers/recipes"
import { IState } from "@/store/store"
import { ICalRecipe } from "@/store/reducers/calendar"
import { IRecipeItemDrag } from "@/components/RecipeItem"
import { Result } from "@/result"

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
  const dateFmt = isFirstDayOfMonth(date) ? "MMM D" : "D"
  return (
    <p className="d-flex">
      <DayOfWeek date={date} />
      <span>{format(date, dateFmt)}</span>
    </p>
  )
}

interface ICalendarDayProps {
  readonly date: Date
  readonly connectDropTarget: ConnectDropTarget
  readonly isOver: boolean
  readonly canDrop: boolean
  readonly scheduledRecipes?: ICalRecipe[]
  readonly updateCount: (
    id: ICalRecipe["id"],
    teamID: TeamID,
    count: ICalRecipe["count"]
  ) => Promise<Result<void, void>>
  readonly refetchShoppingList: (teamID: TeamID) => void
  readonly remove: (id: ICalRecipe["id"], teamID: TeamID) => void
  readonly move: (id: ICalRecipe["id"], teamID: TeamID, date: Date) => void
  readonly create: (
    recipeID: IRecipe["id"],
    teamID: TeamID,
    date: Date,
    count: number
  ) => void
  readonly teamID: TeamID
  readonly isSelected: boolean
}

function CalendarDay({
  date,
  connectDropTarget,
  isOver,
  canDrop,
  scheduledRecipes,
  updateCount,
  refetchShoppingList,
  remove,
  teamID,
  isSelected
}: ICalendarDayProps) {
  return connectDropTarget(
    <div
      style={{
        opacity: isOver && canDrop ? 0.5 : 1
      }}
      className={classNames("calendar-day", "p-1", "flex-grow-1", {
        "current-day": isToday(date),
        "selected-day": isSelected || (isOver && canDrop)
      })}>
      <Title date={date} />
      <ul>
        {scheduledRecipes &&
          scheduledRecipes.map(x => (
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
  props: Pick<ICalendarDayProps, "date" | "scheduledRecipes">
) {
  const isShopping =
    state.routerReducer.location != null
      ? state.routerReducer.location.pathname.includes("shopping")
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
  create: addingScheduledRecipe(dispatch),
  updateCount: updatingScheduledRecipe(dispatch),
  refetchShoppingList: fetchingShoppingList(dispatch),
  move: moveScheduledRecipe(dispatch),
  remove: deletingScheduledRecipe(dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  DropTarget(
    [DragDrop.RECIPE, DragDrop.CAL_RECIPE],
    {
      canDrop({ date }: Pick<ICalendarDayProps, "date">) {
        // event when copying from past, we don't want to copy to past dates
        return !beforeCurrentDay(date)
      },
      drop(
        props: Pick<ICalendarDayProps, "move" | "teamID" | "date" | "create">,
        monitor: DropTargetMonitor
      ) {
        const recipe: ICalendarDragItem | IRecipeItemDrag = monitor.getItem()
        // NOTE(chdsbd): We use Promise.resolve to elminate slow drop event
        // warnings.
        if (recipe.kind === DragDrop.CAL_RECIPE) {
          Promise.resolve().then(() =>
            props.move(recipe.id, props.teamID, props.date)
          )
        } else if (recipe.kind === DragDrop.RECIPE) {
          Promise.resolve().then(() =>
            props.create(recipe.recipeID, props.teamID, props.date, 1)
          )
        }
      }
    },
    (cnct, monitor) => {
      return {
        connectDropTarget: cnct.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      }
    }
  )(CalendarDay)
)
