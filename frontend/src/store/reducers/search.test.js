import search from "./search"
import {
  setSearchResults,
  clearSearchResults,
  incrLoadingSearch
} from "../actions.js"

describe("search", () => {
  test("action#setSearchResults", () => {
    const beforeState = {
      results: []
    }

    const afterState = {
      results: ["test_result", 123]
    }

    expect(search(beforeState, setSearchResults(["test_result", 123]))).toEqual(
      afterState
    )
  })
  test("action#clearSearchResults", () => {
    const beforeState = {
      results: [123]
    }

    const afterState = {
      results: []
    }

    expect(search(beforeState, clearSearchResults())).toEqual(afterState)
  })
  test("action#incrLoadingSearch", () => {
    const beforeState = {
      loading: 2
    }

    expect(search(beforeState, incrLoadingSearch(2))).toEqual({ loading: 4 })
    expect(search(beforeState, incrLoadingSearch(-1))).toEqual({ loading: 1 })
    expect(() => search(beforeState, incrLoadingSearch(-5))).toThrow()

    expect(() => search(beforeState, incrLoadingSearch())).toThrow()
  })
})
