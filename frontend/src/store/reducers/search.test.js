import search from './search'
import {
  setSearchResults,
  clearSearchResults,
  incrLoadingSearch,
  decrLoadingSearch,
} from '../actions.js'

describe('search', () => {
  test('action#setSearchResults', () => {
    const beforeState = {
      results: []
    }

    const afterState = {
      results: ['test_result', 123]
    }

    expect(search(beforeState, setSearchResults(['test_result', 123]))).toEqual(
      afterState
    )
  })
  test('action#clearSearchResults', () => {
    const beforeState = {
      results: [123]
    }

    const afterState = {
      results: []
    }

    expect(search(beforeState, clearSearchResults())).toEqual(afterState)
  })
  test('action#incrLoadingSearch', () => {
    const beforeState = {
      loading: 2
    }

    const afterState = {
      loading: 3
    }

    expect(search(beforeState, incrLoadingSearch())).toEqual(afterState)
  })
  test('action#decrLoadingSearch', () => {
    const beforeState = {
      loading: 2
    }

    const afterState = {
      loading: 1
    }

    expect(search(beforeState, decrLoadingSearch())).toEqual(afterState)

    expect(() => search({ loading: 0 }, decrLoadingSearch())).toThrow()
  })
})
