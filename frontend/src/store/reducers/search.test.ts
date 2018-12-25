import search, { ISearchState } from "./search"
import * as a from "./search"
import { baseRecipe } from "./recipes.test";

describe("search", () => {
  test("action#setSearchResults", () => {
    const beforeState: ISearchState = {
      results: [],
      loading: 0
    }

    const afterState: ISearchState = {
      results: [baseRecipe],
      loading: 0
    }

    expect(
      search(beforeState, a.setSearchResults([baseRecipe]))
    ).toEqual(afterState)
  })
  test("action#clearSearchResults", () => {
    const beforeState = {
      results: [baseRecipe],
      loading: 0
    }

    const afterState = {
      results: [],
      loading: 0
    }

    expect(search(beforeState, a.clearSearchResults())).toEqual(afterState)
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

    expect(search(beforeState, a.incrLoadingSearch())).toEqual(afterState)
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

    expect(search(beforeState, a.decrLoadingSearch())).toEqual(afterState)

    expect(search({ loading: 0, results: [] }, a.decrLoadingSearch()).loading).toEqual(0)
  })
})
