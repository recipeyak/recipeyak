import { action } from "typesafe-actions";
import { IRecipe } from "./recipes";

const SET_SEARCH_RESULTS = "SET_SEARCH_RESULTS"
const CLEAR_SEARCH_RESULTS = "CLEAR_SEARCH_RESULTS"
const INCR_LOADING_SEARCH = "INCR_LOADING_SEARCH"
const DECR_LOADING_SEARCH = "DECR_LOADING_SEARCH"

export const setSearchResults = (results: IRecipe[]) => action( SET_SEARCH_RESULTS, results)
export const clearSearchResults = () => action(CLEAR_SEARCH_RESULTS)
export const incrLoadingSearch = () => action(INCR_LOADING_SEARCH)
export const decrLoadingSearch = () => action( DECR_LOADING_SEARCH)


export interface ISearchState {
  readonly loading: number
  readonly results: IRecipe[]
}

export const initialState: ISearchState = {
  results: [],
  loading: 0
}

export type SearchActions =
  | ReturnType<typeof setSearchResults>
  | ReturnType<typeof clearSearchResults>
  | ReturnType<typeof incrLoadingSearch>
  | ReturnType<typeof decrLoadingSearch>

const search = (state: ISearchState = initialState, action: SearchActions): ISearchState => {
  switch (action.type) {
    case SET_SEARCH_RESULTS:
      return { ...state, results: action.payload }
    case CLEAR_SEARCH_RESULTS:
      return { ...state, results: [] }
    case INCR_LOADING_SEARCH:
      return { ...state, loading: state.loading + 1 }
    case DECR_LOADING_SEARCH: {
      const nextVal = Math.max(0, state.loading - 1)
      return { ...state, loading: nextVal }
    }
    default:
      return state
  }
}

export default search
