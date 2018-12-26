import React from "react"
import { connect } from "react-redux"
import startOfMonth from "date-fns/start_of_month"
import endOfMonth from "date-fns/end_of_month"
import eachDay from "date-fns/each_day"
import addMonths from "date-fns/add_months"
import subMonths from "date-fns/sub_months"
import subDays from "date-fns/sub_days"
import addDays from "date-fns/add_days"
import format from "date-fns/format"

import {
  fetchCalendar,
  fetchTeams,
  fetchShoppingList,
  fetchRecipeList,
  Dispatch
} from "../store/actions"

import { pyFormat, daysFromSunday, daysUntilSaturday } from "../date"

import { teamsFrom } from "../store/mapState"

import { push } from "react-router-redux"

import { ButtonPrimary, ButtonPlain } from "./Buttons"
import Loader from "./Loader"
import CalendarDay from "./CalendarDay"
import { RootState } from "../store/store"
import { ITeam } from "../store/reducers/teams"
import { ICalRecipe } from "../store/reducers/calendar"
import { ScheduleRouteParams } from "./Schedule"

function monthYearFromDate(date: Date) {
  return format(date, "MMM | YYYY")
}

interface IDays {
  readonly [key: string]: ICalRecipe
}

const mapStateToProps = (state: RootState, props: ICalendarProps) => {
  const isTeam = props.teamID !== "personal"

  const days = state.calendar.allIds
    // TODO(chdsbd): Remove string | number ids
    .map((id: number | string) => state.calendar[id as number])
    .filter((x: ICalRecipe) => {
      if (!isTeam) {
        // we know that if there is a userID, it will be the current user's
        return x.user != null
      }
      return x.team === props.teamID
    })
    .reduce(
      (a, b) => ({
        ...a,
        [b.on]: {
          ...a[b.on],
          [b.id]: b
        }
      }),
      {} as IDays
    )

  return {
    days,
    loading: state.calendar.loading,
    error: state.calendar.error,
    loadingTeams: !!state.teams.loading,
    teams: teamsFrom(state),
    teamID: props.teamID,
    isTeam,
    start: state.shoppinglist.startDay,
    end: state.shoppinglist.endDay
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchCalendar(dispatch),
  fetchTeams: fetchTeams(dispatch),
  navTo: (url: string) => {
    dispatch(push(url))
  },
  refetchShoppingListAndRecipes: (
    teamID: ITeam["id"] | "personal",
    start: Date,
    end: Date
  ) => {
    return Promise.all([
      fetchRecipeList(dispatch)(teamID),
      fetchShoppingList(dispatch)(teamID, start, end)
    ])
  }
})

interface ICalendarProps extends ScheduleRouteParams {
  readonly loadingTeams: boolean
  readonly loading: boolean
  readonly error: boolean
  readonly className: string
  readonly fetchTeams: () => void
  readonly navTo: (url: string) => void
  readonly fetchData: (
    teamID: ITeam["id"] | "personal",
    month: Date
  ) => Promise<void>
  readonly refetchShoppingListAndRecipes: (
    teamID: ITeam["id"] | "personal",
    startDay: Date,
    endDay: Date
  ) => void
  readonly teams: ReadonlyArray<ITeam>
  readonly days: IDays
  readonly isTeam: boolean
  readonly teamID: ITeam["id"] | "personal"
  readonly startDay: Date
  readonly endDay: Date
  readonly type: "shopping" | "recipes"
}

interface ICalendarState {
  readonly month: Date
  readonly initialLoad: boolean
  readonly owner: ITeam["id"] | "personal"
}

class Calendar extends React.Component<ICalendarProps, ICalendarState> {
  readonly state: ICalendarState = {
    month: new Date(),
    initialLoad: false,
    owner: "personal"
  }

  componentDidMount() {
    this.props.fetchTeams()
    this.props
      .fetchData(this.props.teamID, this.state.month)
      .then(() => this.setState({ initialLoad: true }))
  }

  readonly refetchData = (
    teamID: ITeam["id"] | "personal" = this.props.teamID
  ) => {
    this.props.fetchData(teamID, this.state.month)
    this.props.refetchShoppingListAndRecipes(
      teamID,
      this.props.startDay,
      this.props.endDay
    )
  }

  readonly prevMonth = () => {
    this.setState(({ month }) => ({
      month: subMonths(month, 1)
    }))
    this.props.fetchData(this.props.teamID, this.state.month)
  }

  readonly nextMonth = () => {
    this.setState(({ month }) => ({
      month: addMonths(month, 1)
    }))
    this.props.fetchData(this.props.teamID, this.state.month)
  }

  readonly currentMonth = () => {
    this.setState({ month: new Date() })
  }

  readonly handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamID =
      e.target.value === "personal" ? "personal" : parseInt(e.target.value, 10)
    const url = teamID === "personal" ? "/schedule/" : `/t/${teamID}/schedule/`

    const isRecipes = this.props.type === "recipes"

    const ending = isRecipes ? "recipes" : "shopping"

    const urlWithEnding = url + ending

    // navTo is async so we can't count on the URL to have changed by the time we refetch the data
    this.props.navTo(urlWithEnding)
    this.refetchData(teamID)
  }

  render() {
    if (this.props.error) {
      return <p>Error fetching data</p>
    }

    if (this.props.loading && !this.state.initialLoad) {
      return (
        <div
          className={`d-flex w-100 justify-content-center align-items-center ${
            this.props.className
          }`}>
          <div>
            <Loader />
          </div>
        </div>
      )
    }

    return (
      <div className={`flex-grow-1 ${this.props.className}`}>
        <div className="d-flex justify-space-between align-items-end">
          <div className="d-flex align-items-center">
            <p title={this.state.month.toString()}>
              {monthYearFromDate(this.state.month)}
            </p>
            <div className="select is-small ml-2">
              <select
                onChange={this.handleOwnerChange}
                value={this.props.teamID}
                disabled={this.props.loadingTeams}>
                <option value="personal">Personal</option>
                {this.props.teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <ButtonPlain className="is-small" onClick={this.prevMonth}>
              {"←"}
            </ButtonPlain>
            <ButtonPrimary
              className="ml-1 mr-1 is-small"
              onClick={this.currentMonth}>
              Today
            </ButtonPrimary>
            <ButtonPlain className="is-small" onClick={this.nextMonth}>
              {"→"}
            </ButtonPlain>
          </div>
        </div>
        <div
          className={
            "d-grid grid-gap-1 calendar-grid grid-auto-rows-unset mb-0"
          }>
          <b>Su</b>
          <b>Mo</b>
          <b>Tu</b>
          <b>We</b>
          <b>Th</b>
          <b>Fr</b>
          <b>Sa</b>
        </div>
        <div className={"d-grid grid-gap-1 calendar-grid mb-0"}>
          {eachDay(
            subDays(
              startOfMonth(this.state.month),
              daysFromSunday(this.state.month)
            ),
            addDays(
              endOfMonth(this.state.month),
              daysUntilSaturday(endOfMonth(this.state.month))
            )
          ).map(date => (
            <CalendarDay
              item={this.props.days[pyFormat(date)]}
              date={date}
              key={date.toString()}
              teamID={this.props.teamID}
            />
          ))}
        </div>
        <p className="mt-1">
          press <kbd>?</kbd> for help
        </p>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Calendar)
