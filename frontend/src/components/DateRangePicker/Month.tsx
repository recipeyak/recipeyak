import * as React from "react"
import isWithinInterval from "date-fns/isWithinInterval"
import format from "date-fns/format"
import isPast from "date-fns/isPast"
import isSameDay from "date-fns/isSameDay"
import startOfDay from "date-fns/startOfDay"
import endOfDay from "date-fns/endOfDay"

import { ButtonPlain } from "@/components/Buttons"
import Day from "@/components/DateRangePicker/Day"
import { daysOfMonth, daysFromSunday } from "@/date"

class MonthWeekTitles extends React.Component {
  render() {
    return (
      <div className="grid-entire-row d-grid grid-week">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(x => (
          <div key={x} className="day-of-week">
            {x}
          </div>
        ))}
      </div>
    )
  }
}

interface IMonthProps {
  readonly prevMonth: () => void
  readonly nextMonth: () => void
  readonly handleClick: (date: Date) => void
  readonly date: Date
  readonly showLeft?: boolean
  readonly showRight?: boolean
  readonly startDay: Date
  readonly endDay: Date
}

class Month extends React.Component<IMonthProps> {
  static defaultProps = {
    showRight: false,
    showLeft: false
  }
  render() {
    return (
      <section>
        <div className="d-grid mb-1">
          {this.props.showLeft ? (
            <ButtonPlain
              onClick={this.props.prevMonth}
              size="small"
              className="grid-row-1 grid-column-1 justify-self-left">
              {"←"}
            </ButtonPlain>
          ) : null}
          <div className="text-center grid-row-1 grid-column-1 align-self-center">
            {format(this.props.date, "MMM YYYY")}
          </div>
          {this.props.showRight ? (
            <ButtonPlain
              size="small"
              onClick={this.props.nextMonth}
              className="grid-row-1 grid-column-1 justify-self-end">
              {"→"}
            </ButtonPlain>
          ) : null}
        </div>

        <div className="d-grid grid-week">
          <MonthWeekTitles />
          {Array(daysFromSunday(this.props.date))
            .fill(0)
            .map((_, i) => (
              <div key={i} />
            ))}

          {daysOfMonth(this.props.date).map(date => (
            <Day
              key={date.toString()}
              handleClick={this.props.handleClick}
              date={date}
              inPast={isPast(endOfDay(date))}
              highlight={isWithinInterval(date, {
                start: startOfDay(this.props.startDay),
                end: endOfDay(this.props.endDay)
              })}
              endDate={
                isSameDay(date, this.props.startDay) ||
                isSameDay(date, this.props.endDay)
              }
            />
          ))}
        </div>
      </section>
    )
  }
}

export default Month
