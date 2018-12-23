import * as t from "../actionTypes"
import { AnyAction } from "redux"

export interface ISearchState {
  readonly loading: number
  readonly results: unknown[]
}

export const initialState: ISearchState = {
  results: [],
  loading: 0
}

const search = (state: ISearchState = initialState, action: AnyAction) => {
  switch (action.type) {
    case t.SET_SEARCH_RESULTS:
      return { ...state, results: action.results }
    case t.CLEAR_SEARCH_RESULTS:
      return { ...state, results: [] }
    case t.INCR_LOADING_SEARCH:
      return { ...state, loading: state.loading + 1 }
    case t.DECR_LOADING_SEARCH: {
      const nextVal = state.loading - 1
      if (nextVal < 0) {
        throw Error("Invalid loading state")
      }
      return { ...state, loading: nextVal }
    }
    default:
      return state
  }
}

export default search
