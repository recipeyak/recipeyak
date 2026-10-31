import {
  CalendarDate,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date"
import {
  Button as AriaButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput as AriaDateInput,
  DatePicker as AriaDatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Popover,
} from "react-aria-components"

import { clx } from "@/classnames"
import { toISODateString } from "@/date"

function toCalendarDate(date: Date): CalendarDate {
  return parseDate(toISODateString(date))
}

export function DatePicker({
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: {
  value: Date
  onChange: (date: Date) => void
  "aria-label": string
  className?: string
}) {
  return (
    <AriaDatePicker
      aria-label={ariaLabel}
      value={toCalendarDate(value)}
      onChange={(date) => {
        if (date == null) {
          return
        }
        onChange(date.toDate(getLocalTimeZone()))
      }}
      className={clx("group flex w-full flex-col", className)}
    >
      <Group className="flex w-full items-center rounded-md border border-solid border-[--color-border] bg-[--color-background-card] text-base text-[--color-text] [box-shadow:inset_0_1px_2px_rgba(10,10,10,0.1)] focus-within:border-[--color-primary]">
        <AriaDateInput className="flex flex-1 px-2 py-[5px]">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="rounded-sm px-[1px] tabular-nums caret-transparent outline-none data-[focused]:bg-[--color-primary-default-bg] data-[type=literal]:px-0 data-[focused]:text-[--color-primary-default-text] data-[placeholder]:text-[--color-input-placeholder]"
            />
          )}
        </AriaDateInput>
        <AriaButton className="mr-1 flex size-7 cursor-pointer items-center justify-center rounded border-none bg-transparent text-[--color-text] outline-none hover:bg-[--color-background-calendar-day] data-[focus-visible]:ring-2 data-[focus-visible]:ring-[--color-primary]">
          <CalendarIcon />
        </AriaButton>
      </Group>
      <Popover className="overflow-auto rounded-md border border-solid border-[--color-border] bg-[--color-background-calendar-day] p-2 text-[--color-text] shadow-lg outline-none">
        <Dialog className="outline-none">
          <Calendar>
            <header className="mb-2 flex items-center justify-between gap-2">
              <AriaButton
                slot="previous"
                className="flex size-7 cursor-pointer items-center justify-center rounded border-none bg-transparent text-[--color-text] outline-none hover:bg-[--color-background-card] data-[focus-visible]:ring-2 data-[focus-visible]:ring-[--color-primary]"
              >
                ←
              </AriaButton>
              <Heading className="m-0 text-base font-medium" />
              <AriaButton
                slot="next"
                className="flex size-7 cursor-pointer items-center justify-center rounded border-none bg-transparent text-[--color-text] outline-none hover:bg-[--color-background-card] data-[focus-visible]:ring-2 data-[focus-visible]:ring-[--color-primary]"
              >
                →
              </AriaButton>
            </header>
            <CalendarGrid className="border-collapse">
              {(date) => (
                <CalendarCell
                  date={date}
                  className="flex size-8 cursor-pointer items-center justify-center rounded text-sm outline-none hover:bg-[--color-background-card] data-[outside-month]:hidden data-[selected]:bg-[--color-primary-default-bg] data-[selected]:text-[--color-primary-default-text] data-[unavailable]:text-[--color-text-muted] data-[focus-visible]:ring-2 data-[focus-visible]:ring-[--color-primary]"
                />
              )}
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </AriaDatePicker>
  )
}

function CalendarIcon() {
  return (
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
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
