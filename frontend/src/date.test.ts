import { toISODateString, formatHumanDateTimeRaw } from "@/date"
import { mockTimezone } from "@/testUtils"
import { addDays, subDays, subHours, subMinutes } from "date-fns"

test("toISODateString", () => {
  // Regression test for previous toString util function that didn't handle
  // timezones correctly so each call would shift the time back a day

  // We want to be using a local date like the browser, since
  // `new Date("2011-11-09")` is different in the browser depending on the
  // timezone.
  mockTimezone("US/Pacific", () => {
    expect(new Date().getTimezoneOffset()).not.toBe(0)
    expect(toISODateString(new Date())).toEqual(
      toISODateString(toISODateString(toISODateString(new Date()))),
    )
  })
  expect(new Date().getTimezoneOffset()).toBe(0)
})

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
      "Jan 5 at 9:10 PM",
    )
  })
  // if a date is in the previous year, we should have the year
  test("five days before in previous year", () => {
    const now = new Date("2021-01-01T22:10:10.000Z")
    const fiveDaysBefore = subDays(now, 5)
    expect(formatHumanDateTimeRaw(fiveDaysBefore, now)).toEqual(
      "Dec 27, 2020 at 10:10 PM",
    )
  })
  // when a day is in excess of nine months of our current date, but within the
  // same year, we add the year to disambiguate.
  test("over nine months before in same year", () => {
    const now = new Date("2021-11-01T22:10:10.000Z")
    const nineMonthsBefore = subDays(now, 30 * 9 + 7)
    expect(formatHumanDateTimeRaw(nineMonthsBefore, now)).toEqual(
      "Jan 28, 2021 at 10:10 PM",
    )
  })
  test("over nine months after in same year", () => {
    const now = new Date("2021-01-01T22:10:10.000Z")
    const nineMonthsLater = addDays(now, 30 * 9 + 7)
    expect(formatHumanDateTimeRaw(nineMonthsLater, now)).toEqual(
      "Oct 5, 2021 at 10:10 PM",
    )
  })
})
