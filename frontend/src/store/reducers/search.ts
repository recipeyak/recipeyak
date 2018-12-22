import {
  SET_SEARCH_RESULTS,
  CLEAR_SEARCH_RESULTS,
  INCR_LOADING_SEARCH,
  DECR_LOADING_SEARCH
} from "../actionTypes"
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
    case SET_SEARCH_RESULTS:
      return { ...state, results: action.results }
    case CLEAR_SEARCH_RESULTS:
      return { ...state, results: [] }
    case INCR_LOADING_SEARCH:
      return { ...state, loading: state.loading + 1 }
    case DECR_LOADING_SEARCH: {
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
