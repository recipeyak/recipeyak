import { addDays, subDays, subHours, subMinutes } from "date-fns"

import { formatHumanDateTimeRaw } from "@/date"

test("timezone set to UTC", () => {
  expect(new Date().getTimezoneOffset()).toBe(0)
})

describe("formatHumanDateTimeRaw", () => {
  test("two hours before", () => {
    const now = new Date("2021-01-06T22:10:10.000Z")
    const twoHoursBefore = subMinutes(now, 120)
    expect(formatHumanDateTimeRaw(twoHoursBefore, now)).toEqual(
      "about 2 hours ago",
    )
  })
  // if a date is under one day prior, use relative dates
  test("under 1 day before within same day", () => {
    const now = new Date("2021-01-06T22:10:10.000Z")
    const twoHoursBefore = subHours(now, 20)
    expect(formatHumanDateTimeRaw(twoHoursBefore, now)).toEqual(
      "about 20 hours ago",
    )
  })
  // if a date is in excess of one day prior, write the full date
  test("1 day before, outside of current day", () => {
    const now = new Date("2021-01-06T22:10:10.000Z")
    const twoHoursBefore = subHours(now, 25)
    expect(formatHumanDateTimeRaw(twoHoursBefore, now)).toEqual(
      "Jan 5 at 9:10 pm",
    )
  })
  // if a date is in the previous year, we should have the year
  test("five days before in previous year", () => {
    const now = new Date("2021-01-01T22:10:10.000Z")
    const fiveDaysBefore = subDays(now, 5)
    expect(formatHumanDateTimeRaw(fiveDaysBefore, now)).toEqual(
      "Dec 27, 2020 at 10:10 pm",
    )
  })
  // when a day is in excess of nine months of our current date, but within the
  // same year, we add the year to disambiguate.
  test("over nine months before in same year", () => {
    const now = new Date("2021-11-01T22:10:10.000Z")
    const nineMonthsBefore = subDays(now, 30 * 9 + 7)
    expect(formatHumanDateTimeRaw(nineMonthsBefore, now)).toEqual(
      "Jan 28, 2021 at 10:10 pm",
    )
  })
  test("over nine months after in same year", () => {
    const now = new Date("2021-01-01T22:10:10.000Z")
    const nineMonthsLater = addDays(now, 30 * 9 + 7)
    expect(formatHumanDateTimeRaw(nineMonthsLater, now)).toEqual(
      "Oct 5, 2021 at 10:10 pm",
    )
  })
})
