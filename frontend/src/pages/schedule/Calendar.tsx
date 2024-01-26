import { addWeeks, endOfWeek, startOfWeek, subWeeks } from "date-fns"
import eachDayOfInterval from "date-fns/eachDayOfInterval"
import format from "date-fns/format"
import isValid from "date-fns/isValid"
import parseISO from "date-fns/parseISO"
import { chunk, first } from "lodash-es"
import { useState } from "react"
import { DialogTrigger } from "react-aria-components"
import { useHistory, useLocation } from "react-router-dom"

import { clx } from "@/classnames"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Modal } from "@/components/Modal"
import { toISODateString } from "@/date"
import { CalendarDay } from "@/pages/schedule/CalendarDay"
import HelpMenuModal from "@/pages/schedule/HelpMenuModal"
import { Kbd } from "@/pages/schedule/Kbd"
import { ScheduleRecipeModal } from "@/pages/schedule/ScheduleRecipeModal"
import ShoppingList from "@/pages/schedule/ShoppingList"
import { ScheduledRecipe } from "@/queries/scheduledRecipeCreate"
import { useScheduledRecipeList } from "@/queries/scheduledRecipeList"
import { removeQueryParams, setQueryParams } from "@/querystring"
import { useGlobalEvent } from "@/useGlobalEvent"

function CalTitle({ dayTs }: { readonly dayTs: number }) {
  return (
    <div>
      <span>{format(dayTs, "MMM d")}</span>
      <span className="hidden sm:inline"> | {format(dayTs, "yyyy")}</span>
    </div>
  )
}

export type IDays = Record<string, ScheduledRecipe[] | undefined>

function Weekdays() {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return (
    <div className="hidden grid-cols-7 gap-1 text-sm md:grid">
      {weekDays.map((x) => (
        <div className="font-semibold" key={x}>
          {x}
        </div>
      ))}
    </div>
  )
}

const WEEK_DAYS = 7

interface IDaysProps {
  readonly start: Date
  readonly end: Date
  readonly days: IDays
  readonly isError: boolean
}

function Days({ start, end, isError, days }: IDaysProps) {
  if (isError) {
    return <div className="m-auto">error fetching calendar</div>
  }

  return (
    <div className="mb-2 flex h-full grow flex-col gap-1">
      {chunk(eachDayOfInterval({ start, end }), WEEK_DAYS).map((dates, idx) => {
        const firstDay = first(dates)
        const weekContainerCss = clx(
          "flex h-full shrink-0 flex-col gap-1 md:h-1/3 md:flex-row",
          // Hide the first and last weeks on mobile
          (idx === 0 || idx === 2) && "hidden md:flex",
        )
        if (firstDay == null) {
          return <div className={weekContainerCss} />
        }
        const week = String(startOfWeek(firstDay))
        return (
          <div key={week} className={weekContainerCss}>
            {dates.map((date) => {
              const scheduledRecipes = days[toISODateString(date)] || []
              return (
                <CalendarDay
                  scheduledRecipes={scheduledRecipes}
                  date={date}
                  key={date.toString()}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

const ShopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 17 2 2 4-4" />
    <path d="m3 7 2 2 4-4" />
    <path d="M13 6h8" />
    <path d="M13 12h8" />
    <path d="M13 18h8" />
  </svg>
)

const Plus = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
)
interface INavProps {
  readonly dayTs: number
  readonly onPrev: () => void
  readonly onNext: () => void
  readonly onCurrent: () => void
}

function Nav({ dayTs, onPrev, onNext, onCurrent }: INavProps) {
  return (
    <Box space="between" align="center" shrink={0}>
      <Box gap={1} className="items-center">
        <CalTitle dayTs={dayTs} />
        <DialogTrigger>
          <Button
            size="small"
            data-testid="open shopping list modal"
            className="gap-2"
          >
            <span className="hidden sm:block">Shop</span>
            <ShopIcon />
          </Button>
          <Modal
            title="Shopping List"
            children={
              <div className="flex">
                <ShoppingList />
              </div>
            }
          />
        </DialogTrigger>
        <DialogTrigger>
          <Button size="small" className="gap-2">
            <span className="hidden sm:block">Schedule</span>
            <Plus />
          </Button>
          <ScheduleRecipeModal />
        </DialogTrigger>
      </Box>
      <Box gap={1}>
        <Button size="small" onClick={onPrev} aria-label="previous week">
          {"←"}
        </Button>
        <Button size="small" onClick={onCurrent} aria-label="current week">
          Today
        </Button>
        <Button size="small" onClick={onNext} aria-label="next week">
          {"→"}
        </Button>
      </Box>
    </Box>
  )
}

function HelpPrompt() {
  const [show, setShow] = useState(false)

  useGlobalEvent({
    keyUp: (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el == null || el.tagName !== "BODY") {
        return
      }
      if (e.key === "?") {
        setShow(true)
      }
    },
  })

  return (
    <>
      <div
        className="mb-1 mt-2 hidden md:block"
        onClick={() => {
          setShow(true)
        }}
      >
        press <Kbd>?</Kbd> for help
      </div>
      <HelpMenuModal show={show} onOpenChange={setShow} />
    </>
  )
}

// pull the week from the URL otherwise default to the current time.
function getToday(search: string): Date {
  const week = new URLSearchParams(search).get("week")
  if (week == null || Array.isArray(week)) {
    return new Date()
  }
  const parsedDate = parseISO(week)
  if (isValid(parsedDate)) {
    return parsedDate
  }
  return new Date()
}

export function Calendar() {
  const location = useLocation()
  const today = getToday(location.search)
  const weekStartDate = startOfWeek(today)
  const startOfWeekMs = startOfWeek(weekStartDate).getTime()
  const startDate = startOfWeek(subWeeks(startOfWeekMs, 1))
  const endDate = endOfWeek(addWeeks(startOfWeekMs, 1))
  const history = useHistory()

  const scheduledRecipesResult = useScheduledRecipeList({ startOfWeekMs })

  const scheduledRecipes = scheduledRecipesResult.data?.scheduledRecipes ?? []

  function nextPage() {
    setQueryParams(history, {
      week: toISODateString(addWeeks(weekStartDate, 1)),
    })
  }
  function prevPage() {
    setQueryParams(history, {
      week: toISODateString(subWeeks(weekStartDate, 1)),
    })
  }

  const navCurrent = () => {
    // navigating to the current page when we're already on the current page
    // shouldn't cause another item to be added to the history
    if (location.search !== "") {
      removeQueryParams(history, ["week"])
    }
  }

  const scheduledById: IDays = {}
  scheduledRecipes.forEach((calRecipe) => {
    scheduledById[calRecipe.on] = (scheduledById[calRecipe.on] ?? []).concat(
      calRecipe,
    )
  })

  return (
    <Box dir="col" grow={1} className="gap-2 md:gap-0">
      <Nav
        dayTs={startOfWeekMs}
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
      />
      <HelpPrompt />
    </Box>
  )
}

export default Calendar
