import "@/components/DateRangePicker/date-range-picker.scss"

import addMonths from "date-fns/addMonths"
import endOfDay from "date-fns/endOfDay"
import isPast from "date-fns/isPast"
import * as React from "react"

import { classNames } from "@/classnames"
import Month from "@/components/DateRangePicker/Month"
import { Selecting } from "@/components/ShoppingList"

interface IDateRangePickerProps {
  readonly selecting: Selecting
  readonly setStartDay: (date: Date) => void
  readonly setEndDay: (date: Date) => void
  readonly month: Date
  readonly startDay: Date
  readonly endDay: Date
  readonly nextMonth: () => void
  readonly prevMonth: () => void
  readonly onClose: () => void
}

export default class DateRangePicker extends React.Component<IDateRangePickerProps> {
  handleClick = (date: Date) => {
    if (isPast(endOfDay(date))) {
      return
    }

    if (this.props.selecting === Selecting.Start) {
      this.props.setStartDay(date)
    }

    if (this.props.selecting === Selecting.End) {
      this.props.setEndDay(date)
    }
  }

  render() {
    return (
      <div
        className={classNames(
          "p-absolute",
          "box-shadow-normal",
          "p-2",
          "mt-1",
          "bg-whitesmoke",
          "z-index-100",
          "grid-2-months",
          this.props.selecting !== Selecting.None ? "d-grid" : "d-none",
        )}
      >
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
