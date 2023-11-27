import { pathNamesEqual } from "@/url"

test("pathNamesEqual", () => {
  expect(pathNamesEqual("/example/path", "/example/path")).toEqual(true)
  expect(pathNamesEqual("/example/path?search=123", "/example/path")).toEqual(
    true,
  )
  expect(
    pathNamesEqual(
      "/recipes/61-baked-fish-and-chips-👾",
      "/recipes/61-baked-fish-and-chips-%F0%9F%91%BE",
    ),
  ).toEqual(true)
})
