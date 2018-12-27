import * as React from "react"
import addMonths from "date-fns/add_months"
import isPast from "date-fns/is_past"
import endOfDay from "date-fns/end_of_day"

import { classNames } from "@/classnames"
import Month from "@/components/DateRangePicker/Month"

import "@/components/DateRangePicker/date-range-picker.scss"

interface IDateRangePickerProps {
  readonly selectingStart: boolean
  readonly selectingEnd: boolean
  readonly setStartDay: (date: Date) => void
  readonly setEndDay: (date: Date) => void
  readonly visible: boolean
  readonly month: Date
  readonly startDay: Date
  readonly endDay: Date
  readonly nextMonth: () => void
  readonly prevMonth: () => void
}

class DateRangePicker extends React.Component<IDateRangePickerProps> {
  handleClick = (date: Date) => {
    if (isPast(endOfDay(date))) {
      return
    }

    if (this.props.selectingStart) {
      this.props.setStartDay(date)
    }

    if (this.props.selectingEnd) {
      this.props.setEndDay(date)
    }
  }

  render() {
    return (
      <div
        id="date-range-picker"
        className={classNames(
          "p-absolute",
          "box-shadow-normal",
          "p-2",
          "mt-1",
          "bg-whitesmoke",
          "z-index-100",
          "grid-2-months",
          this.props.visible ? "d-grid" : "d-none"
        )}>
        <Month
          showLeft
          date={this.props.month}
          startDay={this.props.startDay}
          endDay={this.props.endDay}
          handleClick={this.handleClick}
          nextMonth={this.props.nextMonth}
          prevMonth={this.props.prevMonth}
        />
        <Month
          showRight
          date={addMonths(this.props.month, 1)}
          startDay={this.props.startDay}
          endDay={this.props.endDay}
          handleClick={this.handleClick}
          nextMonth={this.props.nextMonth}
          prevMonth={this.props.prevMonth}
        />
      </div>
    )
  }
}

export default DateRangePicker
