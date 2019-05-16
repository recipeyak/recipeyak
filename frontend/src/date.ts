import format from "date-fns/format"
import startOfMonth from "date-fns/start_of_month"
import lastDayOfMonth from "date-fns/last_day_of_month"
import eachDay from "date-fns/each_day"
import isBefore from "date-fns/is_before"
import startOfDay from "date-fns/start_of_day"

export function toDateString(date: Date | string) {
  return format(date, "YYYY-MM-DD")
}

export function daysOfMonth(date: Date) {
  return eachDay(startOfMonth(date), lastDayOfMonth(date))
}

export function daysFromSunday(date: Date) {
  return startOfMonth(date).getDay()
}

export function beforeCurrentDay(date: Date) {
  return isBefore(date, startOfDay(new Date()))
}

export const second = 1000
