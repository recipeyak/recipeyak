import { updateQueryString } from "@/utils/querystring"

test("updateQueryString removes undefined params", () => {
  const actual = updateQueryString(
    { search: undefined },
    "?week=2021-06-06&search=cake",
  )
  expect(actual).toEqual("week=2021-06-06")
})
