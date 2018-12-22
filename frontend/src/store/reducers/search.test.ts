import search, { ISearchState } from "./search"
import {
  setSearchResults,
  clearSearchResults,
  incrLoadingSearch,
  decrLoadingSearch
} from "../actions"

describe("search", () => {
  test("action#setSearchResults", () => {
    const beforeState: ISearchState = {
      results: [],
      loading: 0
    }

    const afterState: ISearchState = {
      results: ["test_result", 123],
      loading: 0
    }

    expect(search(beforeState, setSearchResults(["test_result", 123]))).toEqual(
      afterState
    )
  })
  test("action#clearSearchResults", () => {
    const beforeState = {
      results: [123],
      loading: 0
    }

    const afterState = {
      results: [],
      loading: 0
    }

    expect(search(beforeState, clearSearchResults())).toEqual(afterState)
  })
  test("action#incrLoadingSearch", () => {
    const beforeState: ISearchState = {
      results: [],
      loading: 2
    }

    const afterState: ISearchState = {
      results: [],
      loading: 3
    }

    expect(search(beforeState, incrLoadingSearch())).toEqual(afterState)
  })
  test("action#decrLoadingSearch", () => {
    const beforeState = {
      results: [],
      loading: 2
    }

    const afterState = {
      results: [],
      loading: 1
    }

    expect(search(beforeState, decrLoadingSearch())).toEqual(afterState)

    expect(() =>
      search({ loading: 0, results: [] }, decrLoadingSearch())
    ).toThrow()
  })
})
