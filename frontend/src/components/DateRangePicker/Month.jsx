import React from "react"
import isWithinRange from "date-fns/is_within_range"
import format from "date-fns/format"
import isPast from "date-fns/is_past"
import isSameDay from "date-fns/is_same_day"
import startOfDay from "date-fns/start_of_day"
import endOfDay from "date-fns/end_of_day"

import { ButtonPlain } from "../Buttons"
import Day from "./Day"
import { daysOfMonth, daysFromSunday } from "../../date"

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

class Month extends React.Component {
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
              className="is-small grid-row-1 grid-column-1 justify-self-left">
              {"←"}
            </ButtonPlain>
          ) : null}
          <div className="text-center grid-row-1 grid-column-1 align-self-center">
            {format(this.props.date, "MMM YYYY")}
          </div>
          {this.props.showRight ? (
            <ButtonPlain
              onClick={this.props.nextMonth}
              className="is-small grid-row-1 grid-column-1 justify-self-end">
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
              key={date}
              handleClick={this.props.handleClick}
              date={date}
              inPast={isPast(endOfDay(date))}
              highlight={isWithinRange(
                date,
                startOfDay(this.props.startDay),
                endOfDay(this.props.endDay)
              )}
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
