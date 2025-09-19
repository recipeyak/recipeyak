import { addWeeks, endOfWeek, startOfWeek, subWeeks } from "date-fns"
import eachDayOfInterval from "date-fns/eachDayOfInterval"
import format from "date-fns/format"
import isValid from "date-fns/isValid"
import parseISO from "date-fns/parseISO"
import { chunk, first } from "lodash-es"
import { useEffect, useState } from "react"
import { Dialog, DialogTrigger, Popover } from "react-aria-components"
import { useHistory, useLocation } from "react-router-dom"

import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { Modal } from "@/components/Modal"
import { Select } from "@/components/Select"
import { toISODateString } from "@/date"
import { CalendarDay } from "@/pages/schedule/CalendarDay"
import HelpMenuModal from "@/pages/schedule/HelpMenuModal"
import { Kbd } from "@/pages/schedule/Kbd"
import { ScheduleRecipeModal } from "@/pages/schedule/ScheduleRecipeModal"
import ShoppingList from "@/pages/schedule/ShoppingList"
import { useCalendarMutation } from "@/queries/useCalendarMutation"
import { useCalendars } from "@/queries/useCalendarsFetch"
import { ScheduledRecipe } from "@/queries/useScheduledRecipeCreate"
import { useScheduledRecipeList } from "@/queries/useScheduledRecipeList"
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

type IDays = Record<string, ScheduledRecipe[] | undefined>

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

function ShoppingListButton() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const hasShoppingListQueryParam =
      params.has("shoppingStartDay") && params.has("shoppingEndDay")
    if (hasShoppingListQueryParam) {
      setIsOpen(true)
    }
  }, [location.search])
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
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
  )
}

function ScheduleButton() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const hasScheduleParam = params.has("schedule")
    if (hasScheduleParam) {
      setIsOpen(true)
    }
  }, [location.search])
  return (
    <DialogTrigger
      isOpen={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val)
        if (!val) {
          removeQueryParams(history, ["schedule"])
        }
      }}
    >
      <Button size="small" className="gap-2">
        <span className="hidden sm:block">Schedule</span>
        <Plus />
      </Button>
      <ScheduleRecipeModal />
    </DialogTrigger>
  )
}

function CalendarPickerPopoverContent({
  calendars,
  onSubmit,
}: {
  calendars: { id: number; name: string }[]
  onSubmit: (calendar_id: number) => void
}) {
  const [calendar, setCalendar] = useState<number | null>(0)
  return (
    <Dialog className="flex flex-col gap-2  rounded border border-solid border-[--color-border] bg-[--color-background-card] p-4 shadow-lg">
      <Select
        onChange={(e) => {
          setCalendar(Number(e.target.value))
        }}
        value={calendar || 0}
      >
        <option value="0" disabled>
          Select Calendar
        </option>
        {calendars.map((cal) => (
          <option key={cal.id} value={String(cal.id)}>
            {cal.name}
          </option>
        ))}
      </Select>

      <Button
        onClick={() => {
          if (calendar != null) {
            onSubmit(calendar)
          }
        }}
      >
        Pin Calendar
      </Button>
    </Dialog>
  )
}
function CalendarPicker() {
  const calendars = useCalendars()
  const pinnedCalendar =
    calendars.data?.calendars.find((cal) => cal.pinned) ||
    calendars.data?.calendars[0]
  const pinCalendar = useCalendarMutation()
  if (!pinnedCalendar) {
    return null
  }

  if (calendars.data == null) {
    return null
  }

  return (
    <DialogTrigger>
      <Button>{pinnedCalendar.name}</Button>
      <Popover>
        <CalendarPickerPopoverContent
          calendars={calendars.data.calendars}
          onSubmit={(calendarId) => {
            pinCalendar.mutate({ calendar_id: calendarId })
          }}
        />
      </Popover>
    </DialogTrigger>
  )
}

function Nav({ dayTs, onPrev, onNext, onCurrent }: INavProps) {
  return (
    <div className="flex shrink-0 items-center justify-between">
      <div className="flex items-center gap-1">
        <CalTitle dayTs={dayTs} />
        <ShoppingListButton />
        <ScheduleButton />
        <CalendarPicker />
      </div>
      <div className="flex gap-1">
        <Button size="small" onClick={onPrev} aria-label="previous week">
          {"←"}
        </Button>
        <Button size="small" onClick={onCurrent} aria-label="current week">
          Today
        </Button>
        <Button size="small" onClick={onNext} aria-label="next week">
          {"→"}
        </Button>
      </div>
    </div>
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
    <div className="flex grow flex-col gap-2 md:gap-0">
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
    </div>
  )
}
