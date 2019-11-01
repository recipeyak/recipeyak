import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import eachDayOfInterval from "date-fns/eachDayOfInterval"
import format from "date-fns/format"
import first from "lodash/first"

import {
  fetchCalendarAsync,
  Dispatch,
  fetchingRecipeListAsync,
  fetchingTeamsAsync,
  fetchingShoppingListAsync
} from "@/store/thunks"

import { toDateString } from "@/date"

import { teamsFrom } from "@/store/mapState"

import { push } from "connected-react-router"

import { ButtonPlain } from "@/components/Buttons"
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
import { styled } from "@/theme"

function monthYearFromDate(date: Date) {
  return format(date, "MMM d | yyyy")
}

interface ICalTitleProps {
  readonly day: Date
}

function CalTitle({ day }: ICalTitleProps) {
  return (
    <p title={day.toString()} className="mr-2">
      {monthYearFromDate(day)}
    </p>
  )
}

export interface IDays {
  [onDate: string]: ICalRecipe[] | undefined
}

const WeekdaysContainer = styled.div`
  @media (max-width: ${p => p.theme.medium}) {
    display: none;
  }
  display: flex;
  flex-shrink: 0;
  & > b {
    width: ${(1 / 7) * 100}%;
    &:not(:last-child) {
      margin-right: 0.25rem;
    }
  }
`

function Weekdays() {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return (
    <WeekdaysContainer>
      {weekDays.map(x => (
        <b key={x}>{x}</b>
      ))}
    </WeekdaysContainer>
  )
}

const CalendarWeekContainer = styled.div`
  display: flex;
  @media (max-width: ${p => p.theme.medium}) {
    height: 100%;
    flex-direction: column;
    margin-top: 0.5rem;
    &:first-child,
    &:last-child {
      display: none;
    }
  }
  height: ${(1 / 3) * 100}%;
  &:not(:last-child) {
    margin-bottom: 0.25rem;
  }
`

const DaysContainer = styled.div`
  margin-bottom: 0.5rem;
  flex-grow: 1;
  height: 100%;
`

const WEEK_DAYS = 7

interface IDaysProps {
  readonly start: Date
  readonly end: Date
  readonly days: IDays
  readonly teamID: TeamID
}

function Days({ start, end, days, teamID }: IDaysProps) {
  return (
    <DaysContainer>
      {chunk(eachDayOfInterval({ start, end }), WEEK_DAYS).map(dates => {
        const firstDay = first(dates)
        if (firstDay == null) {
          return <CalendarWeekContainer />
        }
        const week = String(startOfWeek(firstDay))
        return (
          <CalendarWeekContainer key={week}>
            {dates.map(date => {
              const scheduledRecipes = days[toDateString(date)] || []
              return (
                <CalendarDay
                  scheduledRecipes={scheduledRecipes}
                  date={date}
                  key={date.toString()}
                  teamID={teamID}
                />
              )
            })}
          </CalendarWeekContainer>
        )
      })}
    </DaysContainer>
  )
}

interface ITeamSelectProps {
  readonly handleOwnerChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  readonly teams: ReadonlyArray<ITeam>
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
      disabled={loading}>
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
  readonly teams: ReadonlyArray<ITeam>
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
    <section className="d-flex flex-grow justify-space-between align-items-center">
      <div className="d-flex">
        <CalTitle day={day} />
        <TeamSelect
          teams={teams}
          teamID={teamID}
          handleOwnerChange={handleOwnerChange}
          loading={loadingTeams}
        />
      </div>
      <section>
        <ButtonPlain size="small" onClick={prev}>
          {"←"}
        </ButtonPlain>
        <ButtonPlain size="small" className="ml-1 mr-1" onClick={current}>
          Today
        </ButtonPlain>
        <ButtonPlain size="small" onClick={next}>
          {"→"}
        </ButtonPlain>
      </section>
    </section>
  )
}

function HelpPrompt() {
  return (
    <p className="mt-2 mb-1 hide-sm">
      press <kbd>?</kbd> for help
    </p>
  )
}

const prevWeekStart = (date: Date) => subWeeks(startOfWeek(date), 1)
const nextWeekStart = (date: Date) => addWeeks(startOfWeek(date), 1)

const CalContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  @media (max-width: ${p => p.theme.small}) {
    height: 100%;
  }
`

interface ICalendarProps {
  readonly loadingTeams: boolean
  readonly error: boolean
  readonly fetchTeams: () => void
  readonly navTo: (url: string) => void
  readonly fetchData: (teamID: TeamID, month: Date) => void
  readonly refetchShoppingListAndRecipes: (teamID: TeamID) => void
  readonly teams: ReadonlyArray<ITeam>
  readonly days: IDays
  readonly teamID: TeamID
  readonly type: "shopping" | "recipes"
}

export function Calendar({
  fetchTeams,
  fetchData,
  teamID: propsTeamID,
  days,
  refetchShoppingListAndRecipes,
  type,
  navTo,
  error,
  teams,
  loadingTeams
}: ICalendarProps) {
  const [start, setStart] = useState(startOfWeek(new Date()))

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const refetchData = (teamID: TeamID = propsTeamID) => {
    fetchData(teamID, start)
    refetchShoppingListAndRecipes(teamID)
  }

  useEffect(() => {
    fetchData(propsTeamID, start)
  }, [fetchData, propsTeamID, start])

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

    const isRecipes = type === "recipes"

    const ending = isRecipes ? "recipes" : "shopping"

    const urlWithEnding = url + ending

    // navTo is async so we can't count on the URL to have changed by the time we refetch the data
    navTo(urlWithEnding)
    refetchData(teamID)
  }

  if (error) {
    return <p>Error fetching data</p>
  }

  const currentDate = startOfWeek(start)
  const startDate = startOfWeek(subWeeks(currentDate, 1))
  const endDate = endOfWeek(addWeeks(currentDate, 1))

  return (
    <CalContainer>
      <Nav
        teams={teams}
        loadingTeams={loadingTeams}
        handleOwnerChange={handleOwnerChange}
        day={currentDate}
        teamID={propsTeamID}
        next={next}
        prev={prev}
        current={current}
      />
      <Weekdays />
      <Days start={startDate} end={endDate} days={days} teamID={propsTeamID} />
      <HelpPrompt />
    </CalContainer>
  )
}

const mapStateToProps = (
  state: IState,
  { teamID }: Pick<ICalendarProps, "teamID">
) => {
  const isTeam = teamID !== "personal"

  const days = isTeam
    ? getTeamRecipes(state.calendar)
    : getPersonalRecipes(state.calendar)

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
  fetchData: fetchCalendarAsync(dispatch),
  fetchTeams: fetchingTeamsAsync(dispatch),
  navTo: (url: string) => {
    dispatch(push(url))
  },
  refetchShoppingListAndRecipes: (teamID: TeamID) => {
    return Promise.all([
      fetchingRecipeListAsync(dispatch)(teamID),
      fetchingShoppingListAsync(dispatch)(teamID)
    ])
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Calendar)
