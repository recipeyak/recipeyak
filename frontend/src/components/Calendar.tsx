import React, { useEffect } from "react"
import eachDayOfInterval from "date-fns/eachDayOfInterval"
import format from "date-fns/format"
import first from "lodash/first"
import { history } from "@/store/store"
import queryString from "query-string"
import parseISO from "date-fns/parseISO"
import isValid from "date-fns/isValid"
import { useLocation } from "react-router-dom"

import {
  fetchCalendarAsync,
  fetchingRecipeListAsync,
  fetchingTeamsAsync,
  fetchingShoppingListAsync,
} from "@/store/thunks"

import { toISODateString } from "@/date"

import { teamsFrom } from "@/store/mapState"

import { push } from "connected-react-router"

import { ButtonPlain } from "@/components/Buttons"
import CalendarDay from "@/components/CalendarDay"
import { CalendarMoreDropdown } from "@/components/CalendarMoreDropdown"
import { ITeam } from "@/store/reducers/teams"
import {
  ICalRecipe,
  getTeamRecipes,
  getPersonalRecipes,
  updateCalendarSettings,
  regenerateCalendarLink as regenerateCalendarLinkAction,
} from "@/store/reducers/calendar"
import { subWeeks, addWeeks, startOfWeek, endOfWeek } from "date-fns"
import { Select } from "@/components/Forms"
import chunk from "lodash/chunk"
import { styled } from "@/theme"
import { useSelector, useDispatch, useOnWindowFocusChange } from "@/hooks"
import {
  isFailure,
  Success,
  Loading,
  WebData,
  isSuccessLike,
  Failure,
} from "@/webdata"

function CalTitle({ dayTs }: { readonly dayTs: number }) {
  return (
    <p className="mr-2">
      <span>{format(dayTs, "MMM d")}</span>
      <span className="hide-sm"> | {format(dayTs, "yyyy")}</span>
    </p>
  )
}

export interface IDays {
  [onDate: string]: ICalRecipe[] | undefined
}

const WeekdaysContainer = styled.div`
  @media (max-width: ${(p) => p.theme.medium}) {
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
      {weekDays.map((x) => (
        <b key={x}>{x}</b>
      ))}
    </WeekdaysContainer>
  )
}

const CalendarWeekContainer = styled.div`
  display: flex;
  @media (max-width: ${(p) => p.theme.medium}) {
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
  readonly teamID: number | "personal"
}

function Days({ start, end, days, teamID }: IDaysProps) {
  if (isFailure(days)) {
    return <p className="m-auto">error fetching calendar</p>
  }

  const daysData = isSuccessLike(days) ? days.data : {}

  return (
    <DaysContainer>
      {chunk(eachDayOfInterval({ start, end }), WEEK_DAYS).map((dates) => {
        const firstDay = first(dates)
        if (firstDay == null) {
          return <CalendarWeekContainer />
        }
        const week = String(startOfWeek(firstDay))
        return (
          <CalendarWeekContainer key={week}>
            {dates.map((date) => {
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
  readonly value: number | "personal"
}

function TeamSelect({ onChange, value, teams }: ITeamSelectProps) {
  const disabled = !isSuccessLike(teams)
  return (
    <Select onChange={onChange} value={value} size="small" disabled={disabled}>
      <option value="personal">Personal</option>
      {isSuccessLike(teams)
        ? teams.data.map((t) => (
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
  readonly teamID: number | "personal"
  readonly type: "shopping" | "recipes"
}

function Nav({ dayTs, teamID, onPrev, onNext, onCurrent, type }: INavProps) {
  const { handleOwnerChange, teams } = useTeamSelect(dayTs, type)

  const { settings, setSyncEnabled, regenerateCalendarLink } =
    useCalendarSettings(teamID)

  return (
    <section className="d-flex justify-space-between align-items-center flex-shrink-0">
      <div className="d-flex">
        <CalTitle dayTs={dayTs} />
        <TeamSelect teams={teams} value={teamID} onChange={handleOwnerChange} />
        <CalendarMoreDropdown
          settings={settings}
          setSyncEnabled={setSyncEnabled}
          regenerateCalendarLink={regenerateCalendarLink}
        />
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

const CalContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

// pull the week from the URL otherwise default to the current time.
function getToday(search: string): Date {
  const week = queryString.parse(search).week
  if (week == null || Array.isArray(week)) {
    return new Date()
  }
  const parsedDate = parseISO(week)
  if (isValid(parsedDate)) {
    return parsedDate
  }
  return new Date()
}

function useCurrentWeek() {
  const location = useLocation()
  const today = getToday(location.search)
  const weekStartDate = startOfWeek(today)

  const currentDateTs = startOfWeek(weekStartDate).getTime()
  const startDate = startOfWeek(subWeeks(currentDateTs, 1))
  const endDate = endOfWeek(addWeeks(currentDateTs, 1))

  const navPrev = () => {
    history.push({
      search: queryString.stringify({
        week: toISODateString(subWeeks(weekStartDate, 1)),
      }),
    })
  }

  const navNext = () => {
    history.push({
      search: queryString.stringify({
        week: toISODateString(addWeeks(weekStartDate, 1)),
      }),
    })
  }

  const navCurrent = () => {
    // navigating to the current page when we're already on the current page
    // shouldn't cause another item to be added to the history
    if (location.search !== "") {
      history.push({ search: "" })
    }
  }

  return { currentDateTs, startDate, endDate, navNext, navPrev, navCurrent }
}

function useTeams(): WebData<ReadonlyArray<ITeam>> {
  const dispatch = useDispatch()
  const teams = useSelector(teamsFrom)
  useEffect(() => {
    void fetchingTeamsAsync(dispatch)()
  }, [dispatch])

  const status = useSelector((s) => s.teams.status)

  if (status === "initial") {
    return undefined
  }
  if (status === "failure") {
    return Failure(undefined)
  }
  if (status === "loading") {
    return Loading()
  }

  return Success(teams)
}

function useDays(
  teamID: number | "personal",
  currentDateTs: number,
): WebData<IDays> {
  const dispatch = useDispatch()

  const fetchData = React.useCallback(() => {
    void fetchCalendarAsync(dispatch)(teamID, currentDateTs)
  }, [currentDateTs, dispatch, teamID])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useOnWindowFocusChange(fetchData)

  const isTeam = teamID !== "personal"
  const days = useSelector((s) => {
    if (isTeam) {
      return getTeamRecipes(s.calendar)
    }
    return getPersonalRecipes(s.calendar)
  })

  const status = useSelector((s) => s.calendar.status)

  if (status === "loading") {
    return Loading()
  }

  if (status === "failure") {
    return Failure(undefined)
  }

  return Success(
    days.reduce<IDays>((a, b) => {
      a[b.on] = (a[b.on] || []).concat(b)
      return a
    }, {}),
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
    void fetchCalendarAsync(dispatch)(teamID, currentDateTs)
    void fetchingRecipeListAsync(dispatch)()
    void fetchingShoppingListAsync(dispatch)(teamID)
  }

  return { handleOwnerChange, teams }
}

function useCalendarSettings(teamID: number | "personal") {
  const settings = useSelector((s) => s.calendar.settings)
  const dispatch = useDispatch()
  const setSyncEnabled = (syncEnabled: boolean) => {
    dispatch(
      updateCalendarSettings.request({
        teamID,
        syncEnabled,
      }),
    )
  }
  const regenerateCalendarLink = () => {
    dispatch(
      regenerateCalendarLinkAction.request({
        teamID,
      }),
    )
  }
  return { settings, setSyncEnabled, regenerateCalendarLink }
}

interface ICalendarProps {
  readonly teamID: number | "personal"
  readonly type: "shopping" | "recipes"
}

export function Calendar({ teamID, type }: ICalendarProps) {
  const { currentDateTs, startDate, endDate, navNext, navCurrent, navPrev } =
    useCurrentWeek()

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
