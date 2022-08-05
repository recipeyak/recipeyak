import addMonths from "date-fns/addMonths"
import endOfDay from "date-fns/endOfDay"
import format from "date-fns/format"
import isPast from "date-fns/isPast"
import subMonths from "date-fns/subMonths"
import React from "react"
import { connect } from "react-redux"

import { classNames } from "@/classnames"
import { ButtonPrimary } from "@/components/Buttons"
import Month from "@/components/DateRangePicker/Month"
import { TextInput } from "@/components/Forms"
import { atLeast1 } from "@/input"
import { createCalendarRecipe } from "@/store/reducers/calendar"
import { IRecipe } from "@/store/reducers/recipes"
import { IState } from "@/store/store"
import { Dispatch } from "@/store/thunks"

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    create: (
      recipeID: IRecipe["id"],
      teamID: number | "personal",
      on: Date,
      count: number,
    ) => dispatch(createCalendarRecipe({ recipeID, teamID, on, count })),
  }
}

function mapStateToProps(state: IState) {
  return {
    teamID: state.user.scheduleTeamID || ("personal" as const),
  }
}

interface IDatePickerProps {
  readonly recipeID: IRecipe["id"]
  readonly teamID: number | "personal"
  readonly show: boolean
  readonly create: (
    recipeID: IRecipe["id"],
    teamID: number | "personal",
    date: Date,
    count: number,
  ) => void
  readonly close: () => void
  readonly scheduling?: boolean
}

interface IDatePickerState {
  readonly count: number
  readonly date: Date
  readonly month: Date
}

class DatePickerForm extends React.Component<
  IDatePickerProps,
  IDatePickerState
> {
  state = {
    count: 1,
    date: new Date(),
    month: new Date(),
  }

  handleDateChange = (val: Date) => {
    if (isPast(endOfDay(val))) {
      return
    }
    this.setState({ date: val })
  }

  handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = atLeast1(e.target.value)
    this.setState({ count })
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    this.props.create(
      this.props.recipeID,
      this.props.teamID,
      this.state.date,
      this.state.count,
    )
    this.props.close()
  }

  nextMonth = () => {
    this.setState(({ month }) => ({ month: addMonths(month, 1) }))
  }

  prevMonth = () => {
    this.setState(({ month }) => ({ month: subMonths(month, 1) }))
  }

  render() {
    if (!this.props.show) {
      return null
    }

    return (
      <div
        className={classNames(
          "box-shadow-normal",
          "min-width-max-content",
          "p-absolute",
          "r-0",
          "t-100",
          "cursor-default",
          "z-index-100",
          "bg-whitesmoke",
          "p-2",
        )}
      >
        <Month
          showLeft
          showRight
          date={this.state.month}
          startDay={this.state.date}
          endDay={this.state.date}
          handleClick={this.handleDateChange}
          prevMonth={this.prevMonth}
          nextMonth={this.nextMonth}
        />
        <form className="d-grid grid-gap-1" onSubmit={this.handleSubmit}>
          <div className="d-flex">
            <TextInput
              size="small"
              className="w-2rem mr-2 text-small text-center"
              onChange={this.handleCountChange}
              value={this.state.count}
            />
            <span className="align-self-center">
              on {format(this.state.date, "MMM dd, yyyy")}
            </span>
          </div>
          <ButtonPrimary
            size="small"
            type="submit"
            loading={this.props.scheduling}
          >
            Schedule
          </ButtonPrimary>
        </form>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DatePickerForm)
