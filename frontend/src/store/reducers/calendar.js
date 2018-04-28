import { uniq, omit } from 'lodash'

import {
  SET_CALENDAR_RECIPES,
  SET_CALENDAR_RECIPE,
  DELETE_CALENDAR_RECIPE,
  SET_CALENDAR_LOADING,
  SET_CALENDAR_ERROR,
} from '../actionTypes'

const initialState = {
  allIds: [],
  loading: false,
  error: false,
}

export const calendar = (
  state = initialState,
  action
) => {
  switch (action.type) {
  case SET_CALENDAR_RECIPES:
    return {
      ...state,
      ...action.recipes.reduce((a, b) => ({ ...a, [b.id]: b }), {}),
      allIds: uniq(state.allIds.concat(action.recipes.map(x => x.id))),
    }
  case SET_CALENDAR_RECIPE:
    return {
      ...state,
      [action.recipe.id]: action.recipe,
      allIds: uniq(state.allIds.concat(action.recipe.id)),
    }
  case DELETE_CALENDAR_RECIPE:
    return {
      ...omit(state, action.id),
      allIds: state.allIds.filter(id => id !== action.id),
    }
  case SET_CALENDAR_LOADING:
    return {
      ...state,
      loading: action.loading
    }
  case SET_CALENDAR_ERROR:
    return {
      ...state,
      error: action.error
    }
  default:
    return state
  }
}

export default calendar
