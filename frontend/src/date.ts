import format from "date-fns/format"
import startOfMonth from "date-fns/startOfMonth"
import lastDayOfMonth from "date-fns/lastDayOfMonth"
import eachDayOfInterval from "date-fns/eachDayOfInterval"
import parseISO from "date-fns/parseISO"
import isAfter from "date-fns/isAfter"
import subDays from "date-fns/subDays"
import formatDistance from "date-fns/formatDistance"
import min from "date-fns/min"
import { isSameDay, isSameYear, differenceInMonths } from "date-fns"

export function toISODateString(date: Date | string): string {
  // Note(sbdchd): parseISO("2019-11-09") !== new Date("2019-11-09")
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "yyyy-MM-dd")
}

export function daysOfMonth(date: Date) {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: lastDayOfMonth(date),
  })
}

export function daysFromSunday(date: Date) {
  return startOfMonth(date).getDay()
}

export const second = 1000

const DELETION_WINDOW_DAYS = 5

export function isInsideChangeWindow(date: Date): boolean {
  return isAfter(date, subDays(new Date(), DELETION_WINDOW_DAYS))
}

export function formatDistanceToNow(date: Date): string {
  const now = new Date()
  // Avoid clock skew, otherwise the distance can say "in a few seconds"
  // sometimes, which doesn't make sense.
  return formatDistance(min([date, now]), now, { addSuffix: true })
}

export function formatAbsoluteDateTime(
  date: Date,
  options?: { readonly includeYear?: boolean },
): string {
  if (options?.includeYear) {
    return format(date, "MMM d, yyyy 'at' h:mm aaa")
  }
  return format(date, "MMM d 'at' h:mm aaa")
}

export function formatHumanDateTimeRaw(date: Date, now: Date): string {
  if (!isSameYear(date, now)) {
    return formatAbsoluteDateTime(date, { includeYear: true })
  }
  if (isSameDay(date, now)) {
    return formatDistance(date, now, { addSuffix: true })
  }
  const withinNineMonths = Math.abs(differenceInMonths(date, now)) < 9
  if (withinNineMonths) {
    return formatAbsoluteDateTime(date)
  }
  return formatAbsoluteDateTime(date, { includeYear: true })
}

export function formatHumanDateTime(date: Date): string {
  return formatHumanDateTimeRaw(date, new Date())
}

export function formatAbsoluteDate(
  date: Date,
  options?: { readonly includeYear?: boolean },
): string {
  if (options?.includeYear) {
    return format(date, "MMM d, yyyy")
  }
  return format(date, "MMM d")
}

function formatHumanDateRaw(date: Date, now: Date): string {
  if (!isSameYear(date, now)) {
    return formatAbsoluteDate(date, { includeYear: true })
  }
  if (isSameDay(date, now)) {
    return "Today"
  }
  const withinNineMonths = Math.abs(differenceInMonths(date, now)) < 9
  if (withinNineMonths) {
    return formatAbsoluteDate(date)
  }
  return formatAbsoluteDate(date, { includeYear: true })
}

export function formatHumanDate(date: Date): string {
  return formatHumanDateRaw(date, new Date())
}
