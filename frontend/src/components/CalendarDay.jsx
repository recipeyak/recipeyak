import React from 'react'
import { connect } from 'react-redux'
import format from 'date-fns/format'
import isToday from 'date-fns/is_today'
import isFuture from 'date-fns/is_future'
import { DropTarget } from 'react-dnd'
import isWithinRange from 'date-fns/is_within_range'
import startOfDay from 'date-fns/start_of_day'
import endOfDay from 'date-fns/end_of_day'
import isFirstDayOfMonth from 'date-fns/is_first_day_of_month'

import {
  classNames,
} from '../classnames'

import CalendarItem from './CalendarDayItem'

import {
  addingScheduledRecipe,
  updatingScheduledRecipe,
  fetchShoppingList,
} from '../store/actions'

import * as DragDrop from '../dragDrop'

const Title = ({ date }) => {
  if (isFirstDayOfMonth(date)) {
    return <p>{format(date, 'MMM D')}</p>
  }
  return <p>{format(date, 'D')}</p>
}

const dayTarget = {
  canDrop ({ date }) {
    return isFuture(date) || isToday(date)
  },
  drop (props, monitor) {
    const { recipeID } = monitor.getItem()
    props.create(recipeID, props.date, 1)
  }
}

function collect (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  }
}

function mapStateToProps (state, props) {
  const isShopping = state.routerReducer.location.pathname.includes('shopping')
  return {
    isSelected: isWithinRange(
      props.date,
      startOfDay(state.shoppinglist.startDay),
      endOfDay(state.shoppinglist.endDay),
    ) && isShopping
  }
}

function mapDispatchToProps (dispatch) {
  return {
    create: (recipeID, on, count) => dispatch(addingScheduledRecipe(recipeID, on, count)),
    updateCount: (id, count) => dispatch(updatingScheduledRecipe(id, { count })),
    refetchShoppingList: () => dispatch(fetchShoppingList()),
  }
}

@connect(
  mapStateToProps,
  mapDispatchToProps,
)
@DropTarget(DragDrop.RECIPE, dayTarget, collect)
export default class CalendarDay extends React.Component {
  render () {
    const {
      date,
      connectDropTarget,
      isOver,
      canDrop,
      item,
      updateCount,
      refetchShoppingList,
    } = this.props
    return connectDropTarget(
      <div
        style={{
          opacity: isOver && canDrop ? 0.5 : 1,
        }}
        className={classNames(
          'day',
          'p-1',
          {
            'current-day': isToday(date),
            'selected-day': this.props.isSelected,
          }
        )}>
        <Title date={date}/>
        { item != null
            ? Object.values(item).map(x =>
              <CalendarItem key={x.id}
                            recipeName={x.recipe.name}
                            recipeID={x.recipe.id}
                            updateCount={(count) => updateCount(x.id, count)}
                            refetchShoppingList={() => refetchShoppingList()}
                            count={x.count}
              />)
            : null
         }
      </div>
    )
  }
}
