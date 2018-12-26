import React from "react"
import { connect } from "react-redux"
import format from "date-fns/format"
import isToday from "date-fns/is_today"
import { DropTarget, ConnectDropTarget, DropTargetMonitor } from "react-dnd"
import isWithinRange from "date-fns/is_within_range"
import startOfDay from "date-fns/start_of_day"
import endOfDay from "date-fns/end_of_day"
import isFirstDayOfMonth from "date-fns/is_first_day_of_month"

import { beforeCurrentDay } from "../date"

import { classNames } from "../classnames"

import CalendarItem from "./CalendarDayItem"

import {
  addingScheduledRecipe,
  updatingScheduledRecipe,
  fetchShoppingList,
  moveScheduledRecipe,
  deletingScheduledRecipe,
  Dispatch
} from "../store/actions"

import * as DragDrop from "../dragDrop"
import { ITeam } from "../store/reducers/teams"
import { IRecipe } from "../store/reducers/recipes"
import { RootState } from "../store/store"
import { ICalendarState, ICalRecipe } from "../store/reducers/calendar"
import { AxiosResponse } from "axios"

const Title = ({ date }: { date: Date }) => {
  if (isFirstDayOfMonth(date)) {
    return <p>{format(date, "MMM D")}</p>
  }
  return <p>{format(date, "D")}</p>
}

interface ICalendarDayProps {
  readonly date: Date
  readonly connectDropTarget: ConnectDropTarget
  readonly isOver: boolean
  readonly canDrop: boolean
  readonly item: ICalendarState
  readonly updateCount: (
    id: ICalRecipe["id"],
    teamID: ITeam["id"],
    count: ICalRecipe["count"]
  ) => Promise<void | AxiosResponse<void>>
  readonly refetchShoppingList: (teamID: ITeam["id"]) => void
  readonly remove: (id: ICalRecipe["id"], teamID: ITeam["id"]) => void
  readonly move: (id: ICalRecipe["id"], teamID: ITeam["id"], date: Date) => void
  readonly create: (
    recipeID: IRecipe["id"],
    teamID: ITeam["id"],
    date: Date,
    count: string
  ) => void
  readonly teamID: ITeam["id"]
  readonly isSelected: boolean
}

function CalendarDay({
  date,
  connectDropTarget,
  isOver,
  canDrop,
  item,
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
      className={classNames("day", "p-1", {
        "current-day": isToday(date),
        "selected-day": isSelected || (isOver && canDrop)
      })}>
      <Title date={date} />
      {item != null
        ? Object.values(item).map((x: ICalRecipe) => (
            // tslint:disable:no-unsafe-any
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
            // tslint:enable:no-unsafe-any
          ))
        : null}
    </div>
  )
}

function mapStateToProps(state: RootState, props: ICalendarDayProps) {
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

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    create: addingScheduledRecipe(dispatch),
    updateCount: updatingScheduledRecipe(dispatch),
    refetchShoppingList: fetchShoppingList(dispatch),
    move: moveScheduledRecipe(dispatch),
    remove: deletingScheduledRecipe(dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  DropTarget(
    DragDrop.RECIPE,
    {
      canDrop({ date }: ICalendarDayProps) {
        return !beforeCurrentDay(date)
      },
      drop(props: ICalendarDayProps, monitor: DropTargetMonitor) {
        const { recipeID, count = 1, id } = monitor.getItem()
        if (id != null) {
          props.move(id, props.teamID, props.date)
        } else {
          props.create(recipeID, props.teamID, props.date, count)
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
