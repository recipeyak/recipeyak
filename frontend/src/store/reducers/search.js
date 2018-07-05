import {
  SET_SEARCH_RESULTS,
  CLEAR_SEARCH_RESULTS,
  INCR_LOADING_SEARCH,
} from '../actionTypes'

export const initialState = {
  results: [],
  loading: 0,
}

const search = (state = initialState, action) => {
  switch (action.type) {
  case SET_SEARCH_RESULTS:
    return { ...state, results: action.results }
  case CLEAR_SEARCH_RESULTS:
    return { ...state, results: [] }
  case INCR_LOADING_SEARCH:
    const nextVal = state.loading + action.val
    if (nextVal < 0) { throw Error('Invalid loading status') }
    return { ...state, loading: nextVal }
  default:
    return state
  }
}

export default search
