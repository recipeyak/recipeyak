import format from "date-fns/format"
import startOfMonth from "date-fns/startOfMonth"
import lastDayOfMonth from "date-fns/lastDayOfMonth"
import eachDayOfInterval from "date-fns/eachDayOfInterval"
import parseISO from "date-fns/parseISO"
import isAfter from "date-fns/isAfter"
import subDays from "date-fns/subDays"

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
