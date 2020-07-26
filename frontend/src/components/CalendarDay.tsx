import React from "react"
import { connect } from "react-redux"
import format from "date-fns/format"
import { useDrop } from "react-dnd"
import isWithinInterval from "date-fns/isWithinInterval"
import startOfDay from "date-fns/startOfDay"
import endOfDay from "date-fns/endOfDay"
import isFirstDayOfMonth from "date-fns/isFirstDayOfMonth"
import sortBy from "lodash/sortBy"
import { beforeCurrentDay } from "@/date"
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
import { styled, css } from "@/theme"

function DayOfWeek({ date }: { date: Date }) {
  const dayOfWeek = format(date, "E")
  return (
    <div className="d-none d-medium-block">
      <span>{dayOfWeek}</span>
      <span className="mx-1">∙</span>
    </div>
  )
}

const Title = ({ date }: { date: Date }) => {
  const dateFmtText = isFirstDayOfMonth(date) ? "MMM d" : "d"
  return (
    <div className="d-flex">
      <DayOfWeek date={date} />
      <span>{format(date, dateFmtText)}</span>
    </div>
  )
}

const isTodayStyle = css`
  border-bottom: 2px solid ${p => p.theme.color.primary};
`

const isSelectedDayStyle = css`
  background-color: ${p => p.theme.color.primaryShadow};
  color: white;
  a,
  a:hover {
    color: white;
  }
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
  background-color: whitesmoke;
  transition: background-color 0.2s;

  ${p => p.isToday && isTodayStyle}
  ${p => p.isSelectedDay && isSelectedDayStyle}
  ${p => p.isDroppable && isDroppableStyle}

  &:not(:last-child) {
    margin-right: 0.25rem;
    @media (max-width: ${p => p.theme.medium}) {
      margin-right: 0;
      margin-bottom: 0.25rem;
    }
  }
  @media (max-width: ${p => p.theme.medium}) {
    width: 100%;
    min-height: 75px;
  }
`

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
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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

  const isDroppable = isOver && canDrop

  return (
    <CalendarDayContainer
      ref={drop}
      isDroppable={isDroppable}
      isToday={isToday}
      isSelectedDay={isSelected || isDroppable}>
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
    </CalendarDayContainer>
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
      isWithinInterval(props.date, {
        start: startOfDay(state.shoppinglist.startDay),
        end: endOfDay(state.shoppinglist.endDay)
      }) && isShopping
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

export default connect(mapStateToProps, mapDispatchToProps)(CalendarDay)
