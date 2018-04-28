import format from 'date-fns/format'
import startOfMonth from 'date-fns/start_of_month'
import lastDayOfMonth from 'date-fns/last_day_of_month'
import eachDay from 'date-fns/each_day'

export function pyFormat (date) {
  return format(date, 'YYYY-MM-DD')
}

export function daysOfMonth (date) {
  return eachDay(startOfMonth(date), lastDayOfMonth(date))
}

export function daysFromSunday (date) {
  return startOfMonth(date).getDay()
}
