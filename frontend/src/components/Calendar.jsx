import React from 'react'
import { connect } from 'react-redux'
import startOfMonth from 'date-fns/start_of_month'
import endOfMonth from 'date-fns/end_of_month'
import eachDay from 'date-fns/each_day'
import addMonths from 'date-fns/add_months'
import subMonths from 'date-fns/sub_months'
import subDays from 'date-fns/sub_days'
import addDays from 'date-fns/add_days'
import format from 'date-fns/format'

import {
  fetchCalendar,
} from '../store/actions'

import {
  pyFormat,
  daysFromSunday,
  daysUntilSaturday,
} from '../date'

import { ButtonPrimary, ButtonPlain } from './Buttons'
import Loader from './Loader'
import CalendarDay from './CalendarDay'

function monthYearFromDate (date) {
  return format(date, 'MMM | YYYY')
}

const mapStateToProps = state => ({
  days: state.calendar.allIds
      .map(id => state.calendar[id])
      .reduce((a, b) => ({
        ...a,
        [b.on]: {
          ...a[b.on],
          [b.id]: b
        }
      }), {}),
  loading: state.calendar.loading,
  error: state.calendar.error,
})

const mapDispatchToProps = dispatch => ({
  fetchData: (month) => dispatch(fetchCalendar(month)),
})

@connect(
  mapStateToProps,
  mapDispatchToProps,
)
class Calendar extends React.Component {
  state = {
    month: new Date(),
  }

  static defaultProps = {
    loading: true,
    error: false,
    className: '',
  }

  componentDidMount () {
    this.props.fetchData(this.state.month)
  }

  refetchData = () => {
    this.props.fetchData(this.state.month)
  }

  prevMonth = () => {
    this.setState(({ month }) => ({
      month: subMonths(month, 1)
    }), this.refetchData)
  }

  nextMonth = () => {
    this.setState(({ month }) => ({
      month: addMonths(month, 1)
    }), this.refetchData)
  }

  render () {
    if (this.props.error) {
      return (
          <p>Error fetching data</p>
      )
    }

    if (this.props.loading) {
      return (
        <div className={`d-flex w-100 justify-content-center align-items-center ${this.props.className}`}>
          <div>
            <Loader/>
          </div>
        </div>
      )
    }

    return (
      <div className={ `flex-grow-1 ${this.props.className}` }>
          <div className="d-flex justify-space-between align-items-end">
            <div title={ this.state.month.toString() }>
              <p>{ monthYearFromDate(this.state.month) }</p>
            </div>

            <div>
              <ButtonPlain
                className="is-small"
                onClick={this.prevMonth}>
                {'←'}
              </ButtonPlain>
              <ButtonPrimary
                className="ml-1 mr-1 is-small"
                onClick={() => this.setState(({
                  month: (new Date())
                }))}>
                Today
              </ButtonPrimary>
              <ButtonPlain
                className="is-small"
                onClick={this.nextMonth}>
                {'→'}
              </ButtonPlain>
            </div>

          </div>
          <div className={'d-grid grid-gap-1 calendar-grid grid-auto-rows-unset mb-0'} >
            <b>Su</b>
            <b>Mo</b>
            <b>Tu</b>
            <b>We</b>
            <b>Th</b>
            <b>Fr</b>
            <b>Sa</b>
          </div>
          <div className={'d-grid grid-gap-1 calendar-grid mb-0'} >

            {
              eachDay(
                subDays(startOfMonth(this.state.month), daysFromSunday(this.state.month)),
                addDays(endOfMonth(this.state.month), daysUntilSaturday(endOfMonth(this.state.month))),
              ).map((date) =>
                <CalendarDay
                  item={this.props.days[pyFormat(date)]}
                  date={date}
                  key={date}/>
              )
            }
          </div>
          <p className="mt-1">press <key>?</key> for help</p>
        </div>
    )
  }
}

export default Calendar
