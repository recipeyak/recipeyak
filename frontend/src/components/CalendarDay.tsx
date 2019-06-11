import React from "react"
import { connect } from "react-redux"
import format from "date-fns/format"
import { useDrop } from "react-dnd"
import isWithinRange from "date-fns/is_within_range"
import startOfDay from "date-fns/start_of_day"
import endOfDay from "date-fns/end_of_day"
import isFirstDayOfMonth from "date-fns/is_first_day_of_month"

import { beforeCurrentDay } from "@/date"

import { classNames } from "@/classnames"

import CalendarItem, { ICalendarDragItem } from "@/components/CalendarDayItem"

import {
  updatingScheduledRecipe,
  deletingScheduledRecipe,
  Dispatch,
  fetchingShoppingList,
  IAddingScheduledRecipeProps,
  IMoveScheduledRecipeProps
} from "@/store/thunks"

import { DragDrop } from "@/dragDrop"
import { IRecipe } from "@/store/reducers/recipes"
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
    <p className="d-flex">
      <DayOfWeek date={date} />
      <span>{format(date, dateFmtText)}</span>
    </p>
  )
}

interface ICalendarDayProps {
  readonly date: Date
  readonly scheduledRecipes?: ICalRecipe[]
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

  const handleSelect = (id: IRecipe["id"]) => {
    console.info(`selected recipe with id: ${id} for date: ${today}`)
  }

  interface ICollectedProps {
    readonly isOver: boolean
    readonly canDrop: boolean
  }
  const [{ isOver, canDrop }, drop] = useDrop<
    ICalendarDragItem | IRecipeItemDrag,
    void,
    ICollectedProps
  >({
    accept: [DragDrop.RECIPE, DragDrop.CAL_RECIPE],
    canDrop: () => {
      // event when copying from past, we don't want to copy to past dates
      return !beforeCurrentDay(date)
    },
    drop: item => {
      // TOOD(sbdchd): We should move this logic into the calendar reducer
      // NOTE(chdsbd): We use Promise.resolve to elminate slow drop event
      // warnings.
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
  create: (props: IAddingScheduledRecipeProps) =>
    dispatch(createCalendarRecipe(props)),
  updateCount: updatingScheduledRecipe(dispatch),
  refetchShoppingList: fetchingShoppingList(dispatch),
  move: (props: IMoveScheduledRecipeProps) =>
    dispatch(moveOrCreateCalendarRecipe(props)),
  remove: deletingScheduledRecipe(dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CalendarDay)
