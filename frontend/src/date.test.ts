import { toISODateString } from "@/date"
import { mockTimezone } from "@/testUtils"

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
