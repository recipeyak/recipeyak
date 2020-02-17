import React, { useEffect, useState } from "react"
import eachDayOfInterval from "date-fns/eachDayOfInterval"
import format from "date-fns/format"
import first from "lodash/first"

import {
  fetchCalendarAsync,
  fetchingRecipeListAsync,
  fetchingTeamsAsync,
  fetchingShoppingListAsync
} from "@/store/thunks"

import { toISODateString } from "@/date"

import { teamsFrom } from "@/store/mapState"

import { push } from "connected-react-router"

import { ButtonPlain } from "@/components/Buttons"
import CalendarDay from "@/components/CalendarDay"
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
import {
  useCurrentDay,
  useSelector,
  useDispatch,
  useOnWindowFocusChange
} from "@/hooks"
import {
  isFailure,
  Success,
  Loading,
  WebData,
  isSuccessLike,
  Failure
} from "@/webdata"

function monthYearFromDate(date: number) {
  return format(date, "MMM d | yyyy")
}

interface ICalTitleProps {
  readonly dayTs: number
}

function CalTitle({ dayTs }: ICalTitleProps) {
  return <p className="mr-2">{monthYearFromDate(dayTs)}</p>
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
  readonly days: WebData<IDays>
  readonly teamID: TeamID
}

function Days({ start, end, days, teamID }: IDaysProps) {
  if (isFailure(days)) {
    return <p>error fetching calendar</p>
  }

  const daysData = isSuccessLike(days) ? days.data : {}

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
              const scheduledRecipes = daysData[toISODateString(date)] || []
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
  readonly onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  readonly teams: WebData<ReadonlyArray<ITeam>>
  readonly value: TeamID
}

function TeamSelect({ onChange, value, teams }: ITeamSelectProps) {
  const disabled = !isSuccessLike(teams)
  return (
    <Select onChange={onChange} value={value} size="small" disabled={disabled}>
      <option value="personal">Personal</option>
      {isSuccessLike(teams)
        ? teams.data.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))
        : null}
    </Select>
  )
}

interface INavProps {
  readonly dayTs: number
  readonly onPrev: () => void
  readonly onNext: () => void
  readonly onCurrent: () => void
  readonly teamID: TeamID
  readonly type: "shopping" | "recipes"
}

function Nav({ dayTs, teamID, onPrev, onNext, onCurrent, type }: INavProps) {
  const { handleOwnerChange, teams } = useTeamSelect(dayTs, type)

  return (
    <section className="d-flex flex-grow justify-space-between align-items-center">
      <div className="d-flex">
        <CalTitle dayTs={dayTs} />
        <TeamSelect teams={teams} value={teamID} onChange={handleOwnerChange} />
      </div>
      <section>
        <ButtonPlain size="small" onClick={onPrev}>
          {"←"}
        </ButtonPlain>
        <ButtonPlain size="small" className="ml-1 mr-1" onClick={onCurrent}>
          Today
        </ButtonPlain>
        <ButtonPlain size="small" onClick={onNext}>
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

const prevWeekStart = (date: Date | number) => subWeeks(startOfWeek(date), 1)
const nextWeekStart = (date: Date | number) => addWeeks(startOfWeek(date), 1)

const CalContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  @media (max-width: ${p => p.theme.small}) {
    height: 100%;
  }
`

interface IUseCurrentWeekState {
  readonly weekStartDate: Date
  readonly isTouched: boolean
}

function useCurrentWeek() {
  const today = useCurrentDay()
  const [{ weekStartDate }, setStart] = useState<IUseCurrentWeekState>(() => ({
    weekStartDate: startOfWeek(today),
    isTouched: true
  }))
  React.useEffect(() => {
    // Only update the current day if we aren't navigating the calendar.
    setStart(prev => {
      if (prev.isTouched) {
        return prev
      }
      return { ...prev, weekStartDate: startOfWeek(today) }
    })
  }, [today])

  const currentDateTs = startOfWeek(weekStartDate).getTime()
  const startDate = startOfWeek(subWeeks(currentDateTs, 1))
  const endDate = endOfWeek(addWeeks(currentDateTs, 1))

  const navPrev = () => {
    setStart(prev => ({
      weekStartDate: prevWeekStart(prev.weekStartDate),
      isTouched: true
    }))
  }

  const navNext = () => {
    setStart(prev => ({
      weekStartDate: nextWeekStart(prev.weekStartDate),
      isTouched: true
    }))
  }

  const navCurrent = () => {
    setStart(() => ({
      weekStartDate: startOfWeek(today),
      isTouched: false
    }))
  }

  return { currentDateTs, startDate, endDate, navNext, navPrev, navCurrent }
}

function useTeams(): WebData<ReadonlyArray<ITeam>> {
  const dispatch = useDispatch()
  const teams = useSelector(teamsFrom)
  useEffect(() => {
    fetchingTeamsAsync(dispatch)()
  }, [dispatch])
  const isLoading = useSelector(s => !!s.teams.loading)

  if (isLoading) {
    return Loading()
  }

  return Success(teams)
}

function useDays(teamID: TeamID, currentDateTs: number): WebData<IDays> {
  const dispatch = useDispatch()

  const fetchData = React.useCallback(() => {
    fetchCalendarAsync(dispatch)(teamID, currentDateTs)
  }, [currentDateTs, dispatch, teamID])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useOnWindowFocusChange(fetchData)

  const isTeam = teamID !== "personal"
  const days = useSelector(s => {
    if (isTeam) {
      return getTeamRecipes(s.calendar)
    }
    return getPersonalRecipes(s.calendar)
  })

  const status = useSelector(s => s.calendar.status)

  if (status === "loading") {
    return Loading()
  }

  if (status === "failure") {
    return Failure(undefined)
  }

  return Success(
    days.reduce((a, b) => {
      a[b.on] = (a[b.on] || []).concat(b)
      return a
    }, {} as IDays)
  )
}

function useTeamSelect(currentDateTs: number, type: "shopping" | "recipes") {
  const teams = useTeams()
  const dispatch = useDispatch()

  const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamID =
      e.target.value === "personal" ? "personal" : parseInt(e.target.value, 10)
    const url = teamID === "personal" ? "/schedule/" : `/t/${teamID}/schedule/`

    const isRecipes = type === "recipes"

    const ending = isRecipes ? "recipes" : "shopping"

    const urlWithEnding = url + ending

    // navTo is async so we can't count on the URL to have changed by the time we refetch the data
    dispatch(push(urlWithEnding))
    fetchCalendarAsync(dispatch)(teamID, currentDateTs)
    fetchingRecipeListAsync(dispatch)(teamID)
    fetchingShoppingListAsync(dispatch)(teamID)
  }

  return { handleOwnerChange, teams }
}

interface ICalendarProps {
  readonly teamID: TeamID
  readonly type: "shopping" | "recipes"
}

export function Calendar({ teamID, type }: ICalendarProps) {
  const {
    currentDateTs,
    startDate,
    endDate,
    navNext,
    navCurrent,
    navPrev
  } = useCurrentWeek()

  const days = useDays(teamID, currentDateTs)

  return (
    <CalContainer>
      <Nav
        dayTs={currentDateTs}
        teamID={teamID}
        onNext={navNext}
        onPrev={navPrev}
        onCurrent={navCurrent}
        type={type}
      />
      <Weekdays />
      <Days start={startDate} end={endDate} days={days} teamID={teamID} />
      <HelpPrompt />
    </CalContainer>
  )
}

export default Calendar
