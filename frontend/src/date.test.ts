import { toISODateString } from "@/date"

test("toISODateString", () => {
  // Regression test for previous toString util function that didn't handle
  // timezones correctly so each call would shift the time back a day
  expect(toISODateString(new Date())).toEqual(
    toISODateString(toISODateString(toISODateString(new Date())))
  )
})
