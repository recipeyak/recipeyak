import { useQueryClient } from "@tanstack/react-query"
import { addWeeks, endOfWeek, startOfWeek, subWeeks } from "date-fns"
import eachDayOfInterval from "date-fns/eachDayOfInterval"
import format from "date-fns/format"
import isValid from "date-fns/isValid"
import parseISO from "date-fns/parseISO"
import { chunk, first } from "lodash-es"
import queryString from "query-string"
import React from "react"
import { useHistory, useLocation } from "react-router-dom"

import { ICalRecipe } from "@/api"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Select } from "@/components/Forms"
import { Modal } from "@/components/Modal"
import { toISODateString } from "@/date"
import { useDispatch, useToggle } from "@/hooks"
import CalendarDay from "@/pages/schedule/CalendarDay"
import { ICalConfig } from "@/pages/schedule/CalendarMoreDropdown"
import { IconSettings } from "@/pages/schedule/IconSettings"
import ShoppingList from "@/pages/schedule/ShoppingList"
import { useScheduledRecipeList } from "@/queries/scheduledRecipeList"
import { useScheduledRecipeSettingsFetch } from "@/queries/scheduledRecipeSettingsFetch"
import { useTeamList } from "@/queries/teamList"
import { history } from "@/store/store"
import { fetchingRecipeListAsync } from "@/store/thunks"
import { styled } from "@/theme"

function CalTitle({ dayTs }: { readonly dayTs: number }) {
  return (
    <div>
      <span>{format(dayTs, "MMM d")}</span>
      <span className="hide-sm"> | {format(dayTs, "yyyy")}</span>
    </div>
  )
}

export type IDays = Record<string, ICalRecipe[] | undefined>

const WeekdaysContainer = styled.div`
  @media (max-width: ${(p) => p.theme.medium}) {
    display: none;
  }
  display: flex;
  font-size: 14px;
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
  readonly teamID: number | "personal"
  readonly days: IDays
  readonly isError: boolean
}

function Days({ start, end, isError, teamID, days }: IDaysProps) {
  if (isError) {
    return <p className="m-auto">error fetching calendar</p>
  }

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
              const scheduledRecipes = days[toISODateString(date)] || []
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
  readonly value: number | "personal"
}

function TeamSelect({ onChange, value }: ITeamSelectProps) {
  const teams = useTeamList()
  return (
    <Select
      onChange={onChange}
      value={value}
      size="small"
      disabled={teams.isLoading}
    >
      <option value="personal">Personal</option>
      {teams.isSuccess
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
}

function Nav({ dayTs, teamID, onPrev, onNext, onCurrent }: INavProps) {
  const { handleOwnerChange } = useTeamSelect()
  const [showSettings, toggleShowSetting] = useToggle()
  const [showShopping, toggleShopping] = useToggle()

  const settings = useScheduledRecipeSettingsFetch()

  return (
    <Box space="between" align="center" shrink={0}>
      <Modal
        show={showSettings}
        onClose={toggleShowSetting}
        title="Calendar Settings"
        content={
          <Box gap={2} dir="col">
            <Box dir="col" align="start" gap={1}>
              <label className="fw-500">Team</label>
              <TeamSelect value={teamID} onChange={handleOwnerChange} />
            </Box>
            <ICalConfig settings={settings} />
          </Box>
        }
      />
      <Modal
        show={showShopping}
        onClose={toggleShopping}
        title="Shopping List"
        content={
          <div className="d-flex">
            <ShoppingList teamID={teamID} />
          </div>
        }
      />

      <Box gap={1}>
        <CalTitle dayTs={dayTs} />
        <Button size="small" className="p-1" onClick={toggleShowSetting}>
          <IconSettings />
        </Button>
        <Button size="small" onClick={toggleShopping}>
          Shopping
        </Button>
      </Box>
      <Box gap={1}>
        <Button size="small" onClick={onPrev}>
          {"←"}
        </Button>
        <Button size="small" onClick={onCurrent}>
          Today
        </Button>
        <Button size="small" onClick={onNext}>
          {"→"}
        </Button>
      </Box>
    </Box>
  )
}

function HelpPrompt() {
  return (
    <p className="mt-2 mb-1 hide-sm">
      press <kbd>?</kbd> for help
    </p>
  )
}

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

function useTeamSelect() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const history = useHistory()

  const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamID =
      e.target.value === "personal" ? "personal" : parseInt(e.target.value, 10)
    const url = teamID === "personal" ? "/schedule/" : `/t/${teamID}/schedule/`

    const ending = "recipes"

    const urlWithEnding = url + ending

    // navTo is async so we can't count on the URL to have changed by the time we refetch the data
    history.push(urlWithEnding)
    void fetchingRecipeListAsync(dispatch)()
    // TODO: we should abstract this
    void queryClient.invalidateQueries([teamID])
  }

  return { handleOwnerChange }
}

interface ICalendarProps {
  readonly teamID: number | "personal"
}

export function Calendar({ teamID }: ICalendarProps) {
  const location = useLocation()
  const today = getToday(location.search)
  const weekStartDate = startOfWeek(today)
  const startOfWeekMs = startOfWeek(weekStartDate).getTime()
  const startDate = startOfWeek(subWeeks(startOfWeekMs, 1))
  const endDate = endOfWeek(addWeeks(startOfWeekMs, 1))

  const scheduledRecipesResult = useScheduledRecipeList({ startOfWeekMs })

  const scheduledRecipes: ICalRecipe[] =
    scheduledRecipesResult.data?.scheduledRecipes ?? []

  function nextPage() {
    history.push({
      search: queryString.stringify({
        week: toISODateString(addWeeks(weekStartDate, 1)),
      }),
    })
  }
  function prevPage() {
    history.push({
      search: queryString.stringify({
        week: toISODateString(subWeeks(weekStartDate, 1)),
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

  const scheduledById: IDays = {}
  scheduledRecipes.forEach((calRecipe) => {
    scheduledById[calRecipe.on] = (scheduledById[calRecipe.on] ?? []).concat(
      calRecipe,
    )
  })

  return (
    <Box dir="col" grow={1}>
      <Nav
        dayTs={startOfWeekMs}
        teamID={teamID}
        onNext={nextPage}
        onPrev={prevPage}
        onCurrent={navCurrent}
      />
      <Weekdays />
      <Days
        start={startDate}
        end={endDate}
        days={scheduledById}
        isError={scheduledRecipesResult.isError}
        teamID={teamID}
      />
      <HelpPrompt />
    </Box>
  )
}

export default Calendar
