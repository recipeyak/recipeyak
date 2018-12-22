import { toURL } from "./urls"

describe("#toURL", () => {
  it("replaces #", () => {
    expect(toURL("/recipes/12-####")).toEqual("%2Frecipes%2F12-%23%23%23%23")
  })
  it("replaces ?", () => {
    expect(toURL("/recipes/12-good?no!")).toEqual("%2Frecipes%2F12-good%3Fno!")
  })
})
