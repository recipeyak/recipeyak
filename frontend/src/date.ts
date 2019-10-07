import format from "date-fns/format"
import startOfMonth from "date-fns/startOfMonth"
import lastDayOfMonth from "date-fns/lastDayOfMonth"
import eachDayOfInterval from "date-fns/eachDayOfInterval"
import isBefore from "date-fns/isBefore"
import startOfDay from "date-fns/startOfDay"

export function toDateString(date: Date | string) {
  return format(date, "YYYY-MM-DD")
}

export function daysOfMonth(date: Date) {
  return eachDayOfInterval(startOfMonth(date), lastDayOfMonth(date))
}

export function daysFromSunday(date: Date) {
  return startOfMonth(date).getDay()
}

export function beforeCurrentDay(date: Date) {
  return isBefore(date, startOfDay(new Date()))
}

export const second = 1000
