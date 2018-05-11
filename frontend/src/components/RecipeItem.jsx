import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { DragSource } from 'react-dnd'
import addMonths from 'date-fns/add_months'
import subMonths from 'date-fns/sub_months'
import format from 'date-fns/format'

import { ButtonPrimary, ButtonPlain } from './Buttons'

import { atLeast1 } from '../input'

import { classNames } from '../classnames'

import Month from './DateRangePicker/Month'

import {
  addingScheduledRecipe,
} from '../store/actions'

import {
  recipeURL,
  teamURL,
} from '../urls'

import * as DragDrop from '../dragDrop'

class DatePicker extends React.Component {
  static defaultProps = {
    showLeft: true,
    showRight: true,
    date: new Date(),
    selectedDate: new Date(),
    prevMonth: x => x,
    nextMonth: x => x,
  }
  render () {
    return (
      <div className="">
        <Month
          showLeft={this.props.showLeft}
          showRight={this.props.showRight}
          date={this.props.date}
          startDay={this.props.selectedDate}
          endDay={this.props.selectedDate}
          handleClick={this.props.handleClick}
          prevMonth={this.props.prevMonth}
          nextMonth={this.props.nextMonth}
        />
      </div>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    create: (recipeID, on, count) => dispatch(addingScheduledRecipe(recipeID, on, count)),
  }
}

const recipeSource = {
  beginDrag (props) {
    return {
      recipeID: props.id
    }
  }
}

function collect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

@DragSource(DragDrop.RECIPE, recipeSource, collect)
@connect(
  null,
  mapDispatchToProps,
)
export default class RecipeItem extends React.Component {
  state = {
    show: false,
    month: new Date(),
    date: new Date(),
    count: 1,
  }

  handleDateChange = val => {
    this.setState({ date: val })
  }

  handleCountChange = e => {
    const count = atLeast1(e.target.value)
    this.setState({ count })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.create(this.props.id, this.state.date, this.state.count)
    .then(() => {
      this.setState({ show: false })
    })
  }

  render () {
    const {
      tags = {},
      name,
      author,
      id,
      url = recipeURL(id, name),
      addingToCart = false,
      owner = {
        type: 'user',
        id: 0,
        name: '',
      },
      connectDragSource,
      isDragging,
    } = this.props

    const spanTags = tags.length > 0
      ? tags.map(tag => <span key={ tag } className="tag is-medium">{ tag }</span>)
      : null
    const ownershipDetail = owner.type === 'team' && owner.name && owner.id
      ? <div className=" text-muted fw-500">
          via <Link to={teamURL(owner.id)} className="text-muted bold">{ owner.name }</Link>
        </div>
      : null

    return connectDragSource(
      <div className="card cursor-move" style={{
        opacity: isDragging ? 0.5 : 1,
        // transform: isDragging ? 'rotate(-5deg)' : '',
      }}>
        <div className="card-content">
          <div className="title fs-6 d-flex justify-space-between p-rel">
            <Link to={ url }>{ name }</Link>
            <ButtonPlain
              onClick={() => this.setState(prev => ({ show: !prev.show }))}
              className="is-small p-relative"
              loading={ addingToCart }>
              •••
            </ButtonPlain>
            { this.state.show
              ? (<div className={
                    classNames(
                      'box-shadow-normal',
                        'p-absolute',
                        'r-0',
                        't-100',
                        'cursor-default',
                        'z-index-100',
                        'bg-whitesmoke',
                        'p-2',
                      'fs-4',
                    )
              }>
                  <DatePicker
                    date={this.state.month}
                    nextMonth={() => this.setState(({ month }) => ({ month: addMonths(month, 1) }))}
                    prevMonth={() => this.setState(({ month }) => ({ month: subMonths(month, 1) }))}
                    selectedDate={this.state.date}
                    handleClick={this.handleDateChange}

                  />
                  <form className="d-grid grid-gap-1" onSubmit={this.handleSubmit}>
                    <div className="d-flex">
                      <input
                        className="my-input is-small w-2rem mr-2 fs-3 text-center"
                        onChange={this.handleCountChange}
                        value={this.state.count}/>
                      <span className="align-self-center">
                        on { format(this.state.date, 'MMM D, YYYY') }
                      </span>
                    </div>
                    <ButtonPrimary className="is-small" type="submit" loading={this.props.scheduling}>
                      Schedule
                    </ButtonPrimary>
                  </form>
                </div>)

                : null
            }

          </div>
          <p className="subtitle fs-4 mb-0">
            { author }
          </p>
          <div className="content">
            { spanTags }
            { ownershipDetail }
          </div>

        </div>
      </div>
    )
  }
}
