import React from "react"
import { connect } from "react-redux"
import eachDay from "date-fns/each_day"
import format from "date-fns/format"

import {
  fetchCalendar,
  fetchTeams,
  fetchShoppingList,
  Dispatch,
  fetchingRecipeList
} from "@/store/actions"

import { toDateString } from "@/date"

import { teamsFrom } from "@/store/mapState"

import { push } from "react-router-redux"

import { ButtonPrimary, ButtonPlain } from "@/components/Buttons"
import CalendarDay from "@/components/CalendarDay"
import { RootState } from "@/store/store"
import { ITeam } from "@/store/reducers/teams"
import {
  ICalRecipe,
  getTeamRecipes,
  getPersonalRecipes
} from "@/store/reducers/calendar"
import { ScheduleRouteParams } from "@/components/Schedule"
import { subWeeks, addWeeks, startOfWeek, endOfWeek } from "date-fns"

function monthYearFromDate(date: Date) {
  return format(date, "MMM DD | YYYY")
}

interface ICalTitleProps {
  readonly day: Date
}

function CalTitle({ day }: ICalTitleProps) {
  return <p title={day.toString()}>{monthYearFromDate(day)}</p>
}

interface IDays {
  readonly [key: string]: ICalRecipe
}

function Weekdays() {
  return (
    <div className="d-grid grid-gap-1 calendar-grid grid-auto-rows-unset mb-0">
      <b>Su</b>
      <b>Mo</b>
      <b>Tu</b>
      <b>We</b>
      <b>Th</b>
      <b>Fr</b>
      <b>Sa</b>
    </div>
  )
}

interface IDaysProps {
  readonly start: Date
  readonly end: Date
  readonly days: IDays
  readonly teamID: ITeam["id"] | "personal"
}

function Days({ start, end, days, teamID }: IDaysProps) {
  return (
    <section className="d-grid grid-gap-1 calendar-grid mb-0 flex-grow-1 h-100">
      {eachDay(start, end).map(date => (
        <CalendarDay
          item={days[toDateString(date)]}
          date={date}
          key={date.toString()}
          teamID={teamID}
        />
      ))}
    </section>
  )
}

interface ITeamSelectProps {
  readonly handleOwnerChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  readonly teams: ITeam[]
  readonly loading: boolean
  readonly teamID: ITeam["id"] | "personal"
}

function TeamSelect({
  handleOwnerChange,
  teamID,
  loading,
  teams
}: ITeamSelectProps) {
  return (
    <div className="select is-small ml-2">
      <select onChange={handleOwnerChange} value={teamID} disabled={loading}>
        <option value="personal">Personal</option>
        {teams.map(t => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  )
}

interface INavProps {
  readonly day: Date
  readonly handleOwnerChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  readonly prev: () => void
  readonly next: () => void
  readonly current: () => void
  readonly teams: ITeam[]
  readonly loadingTeams: boolean
  readonly teamID: ITeam["id"] | "personal"
}

function Nav({
  teams,
  day,
  handleOwnerChange,
  teamID,
  loadingTeams,
  prev,
  next,
  current
}: INavProps) {
  return (
    <div className="d-flex justify-space-between align-items-end">
      <section className="d-flex align-items-center">
        <CalTitle day={day} />
        <TeamSelect
          teams={teams}
          teamID={teamID}
          handleOwnerChange={handleOwnerChange}
          loading={loadingTeams}
        />
      </section>
      <section>
        <ButtonPlain className="is-small" onClick={prev}>
          {"←"}
        </ButtonPlain>
        <ButtonPrimary className="ml-1 mr-1 is-small" onClick={current}>
          Today
        </ButtonPrimary>
        <ButtonPlain className="is-small" onClick={next}>
          {"→"}
        </ButtonPlain>
      </section>
    </div>
  )
}

function HelpPrompt() {
  return (
    <p className="mt-2 mb-1">
      press <kbd>?</kbd> for help
    </p>
  )
}

interface ICalendarProps extends ScheduleRouteParams {
  readonly loadingTeams: boolean
  readonly loading: boolean
  readonly error: boolean
  readonly fetchTeams: () => void
  readonly navTo: (url: string) => void
  readonly fetchData: (teamID: ITeam["id"] | "personal", month: Date) => void
  readonly refetchShoppingListAndRecipes: (
    teamID: ITeam["id"] | "personal",
    startDay: Date,
    endDay: Date
  ) => void
  readonly teams: ITeam[]
  readonly days: IDays
  readonly isTeam: boolean
  readonly teamID: ITeam["id"] | "personal"
  readonly startDay: Date
  readonly endDay: Date
  readonly type: "shopping" | "recipes"
}

interface ICalendarState {
  readonly start: Date
  readonly owner: ITeam["id"] | "personal"
}

class Calendar extends React.Component<ICalendarProps, ICalendarState> {
  state: ICalendarState = {
    start: startOfWeek(new Date()),
    owner: "personal"
  }

  componentDidMount() {
    this.props.fetchTeams()
    this.props.fetchData(this.props.teamID, this.state.start)
  }

  refetchData = (teamID: ITeam["id"] | "personal" = this.props.teamID) => {
    this.props.fetchData(teamID, this.state.start)
    this.props.refetchShoppingListAndRecipes(
      teamID,
      this.props.startDay,
      this.props.endDay
    )
  }

  prev = () => {
    this.setState(prev => ({
      start: subWeeks(prev.start, 1)
    }))
    this.props.fetchData(this.props.teamID, this.state.start)
  }

  next = () => {
    this.setState(prev => ({
      start: addWeeks(prev.start, 1)
    }))
    this.props.fetchData(this.props.teamID, this.state.start)
  }

  current = () => this.setState({ start: startOfWeek(new Date()) })

  handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

    const current = startOfWeek(this.state.start)
    const start = startOfWeek(subWeeks(current, 1))
    const end = endOfWeek(addWeeks(current, 1))
    return (
      <section className="d-flex flex-column flex-grow-1 hide-sm">
        <Nav
          teams={this.props.teams}
          loadingTeams={this.props.loadingTeams}
          handleOwnerChange={this.handleOwnerChange}
          day={current}
          teamID={this.props.teamID}
          next={this.next}
          prev={this.prev}
          current={this.current}
        />
        <Weekdays />
        <Days
          start={start}
          end={end}
          days={this.props.days}
          teamID={this.props.teamID}
        />
        <HelpPrompt />
      </section>
    )
  }
}

const mapStateToProps = (state: RootState, props: ICalendarProps) => {
  const isTeam = props.teamID !== "personal"

  const days = isTeam ? getTeamRecipes(state) : getPersonalRecipes(state)

  const transformedDays = days.reduce(
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
    days: transformedDays,
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
      fetchingRecipeList(dispatch)(teamID),
      fetchShoppingList(dispatch)(teamID, start, end)
    ])
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Calendar)
