import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import eachDay from "date-fns/each_day"
import format from "date-fns/format"

import {
  fetchCalendar,
  Dispatch,
  fetchingRecipeList,
  fetchingTeams,
  fetchingShoppingList
} from "@/store/thunks"

import { toDateString } from "@/date"

import { teamsFrom } from "@/store/mapState"

import { push } from "react-router-redux"

import { ButtonPrimary, ButtonPlain } from "@/components/Buttons"
import CalendarDay from "@/components/CalendarDay"
import { IState } from "@/store/store"
import { ITeam } from "@/store/reducers/teams"
import {
  ICalRecipe,
  getTeamRecipes,
  getPersonalRecipes
} from "@/store/reducers/calendar"
import { subWeeks, addWeeks, startOfWeek, endOfWeek } from "date-fns"
import { Select } from "@/components/Forms"
import chunk from "lodash/chunk"

function monthYearFromDate(date: Date) {
  return format(date, "MMM D | YYYY")
}

interface ICalTitleProps {
  readonly day: Date
}

function CalTitle({ day }: ICalTitleProps) {
  return <p title={day.toString()}>{monthYearFromDate(day)}</p>
}

export interface IDays {
  [onDate: string]: ICalRecipe[] | undefined
}

function Weekdays() {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return (
    <div className="calendar-week-days">
      {weekDays.map(x => (
        <b>{x}</b>
      ))}
    </div>
  )
}

const WEEK_DAYS = 7

interface IDaysProps {
  readonly start: Date
  readonly end: Date
  readonly days: IDays
  readonly teamID: TeamID
}

function Days({ start, end, days, teamID }: IDaysProps) {
  return (
    <section className="mb-2 h-100">
      {chunk(eachDay(start, end), WEEK_DAYS).map(dates => (
        <section className="d-flex flex-grow-1 calendar-week">
          {dates.map(date => (
            <CalendarDay
              scheduledRecipes={days[toDateString(date)]}
              date={date}
              key={date.toString()}
              teamID={teamID}
            />
          ))}
        </section>
      ))}
    </section>
  )
}

interface ITeamSelectProps {
  readonly handleOwnerChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  readonly teams: ITeam[]
  readonly loading: boolean
  readonly teamID: TeamID
}

function TeamSelect({
  handleOwnerChange,
  teamID,
  loading,
  teams
}: ITeamSelectProps) {
  return (
    <Select
      onChange={handleOwnerChange}
      value={teamID}
      size="small"
      disabled={loading}
      className="ml-2">
      <option value="personal">Personal</option>
      {teams.map(t => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </Select>
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
  readonly teamID: TeamID
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
    <div className="d-flex justify-space-between align-items-end min-height-content">
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
        <ButtonPlain size="small" onClick={prev}>
          {"←"}
        </ButtonPlain>
        <ButtonPrimary size="small" className="ml-1 mr-1" onClick={current}>
          Today
        </ButtonPrimary>
        <ButtonPlain size="small" onClick={next}>
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

const prevWeekStart = (date: Date) => subWeeks(startOfWeek(date), 1)
const nextWeekStart = (date: Date) => addWeeks(startOfWeek(date), 1)

interface ICalendarProps {
  readonly loadingTeams: boolean
  readonly loading: boolean
  readonly error: boolean
  readonly fetchTeams: () => void
  readonly navTo: (url: string) => void
  readonly fetchData: (teamID: TeamID, month: Date) => void
  readonly refetchShoppingListAndRecipes: (teamID: TeamID) => void
  readonly teams: ITeam[]
  readonly days: IDays
  readonly isTeam: boolean
  readonly teamID: TeamID
  readonly type: "shopping" | "recipes"
}

function Calendar(props: ICalendarProps) {
  const [start, setStart] = useState(startOfWeek(new Date()))

  useEffect(() => {
    props.fetchTeams()
    props.fetchData(props.teamID, start)
  }, [])

  const refetchData = (teamID: TeamID = props.teamID) => {
    props.fetchData(teamID, start)
    props.refetchShoppingListAndRecipes(teamID)
  }

  useEffect(() => {
    props.fetchData(props.teamID, start)
  }, [start])

  const prev = () => {
    setStart(prevStart => prevWeekStart(prevStart))
  }

  const next = () => {
    setStart(prevStart => nextWeekStart(prevStart))
  }

  const current = () => setStart(startOfWeek(new Date()))

  const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamID =
      e.target.value === "personal" ? "personal" : parseInt(e.target.value, 10)
    const url = teamID === "personal" ? "/schedule/" : `/t/${teamID}/schedule/`

    const isRecipes = props.type === "recipes"

    const ending = isRecipes ? "recipes" : "shopping"

    const urlWithEnding = url + ending

    // navTo is async so we can't count on the URL to have changed by the time we refetch the data
    props.navTo(urlWithEnding)
    refetchData(teamID)
  }

  if (props.error) {
    return <p>Error fetching data</p>
  }

  const currentDate = startOfWeek(start)
  const startDate = startOfWeek(subWeeks(currentDate, 1))
  const endDate = endOfWeek(addWeeks(currentDate, 1))

  return (
    <section className="d-flex flex-column flex-grow-1 hide-sm">
      <Nav
        teams={props.teams}
        loadingTeams={props.loadingTeams}
        handleOwnerChange={handleOwnerChange}
        day={currentDate}
        teamID={props.teamID}
        next={next}
        prev={prev}
        current={current}
      />
      <Weekdays />
      <Days
        start={startDate}
        end={endDate}
        days={props.days}
        teamID={props.teamID}
      />
      <HelpPrompt />
    </section>
  )
}

const mapStateToProps = (
  state: IState,
  { teamID }: Pick<ICalendarProps, "teamID">
) => {
  const isTeam = teamID !== "personal"

  const days = isTeam ? getTeamRecipes(state) : getPersonalRecipes(state)

  const transformedDays: IDays = days.reduce(
    (a, b) => {
      a[b.on] = (a[b.on] || []).concat(b)
      return a
    },
    {} as IDays
  )

  return {
    days: transformedDays,
    loading: state.calendar.loading,
    error: state.calendar.error,
    loadingTeams: !!state.teams.loading,
    teams: teamsFrom(state),
    teamID,
    isTeam
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchCalendar(dispatch),
  fetchTeams: fetchingTeams(dispatch),
  navTo: (url: string) => {
    dispatch(push(url))
  },
  refetchShoppingListAndRecipes: (teamID: TeamID) => {
    return Promise.all([
      fetchingRecipeList(dispatch)(teamID),
      fetchingShoppingList(dispatch)(teamID)
    ])
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Calendar)
