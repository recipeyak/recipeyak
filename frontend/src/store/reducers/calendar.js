import { uniq, omit } from 'lodash'
import isSameDay from 'date-fns/is_same_day'

import {
  SET_CALENDAR_RECIPES,
  SET_CALENDAR_RECIPE,
  DELETE_CALENDAR_RECIPE,
  SET_CALENDAR_LOADING,
  SET_CALENDAR_ERROR,
  MOVE_CALENDAR_RECIPE,
  REPLACE_CALENDAR_RECIPE,
} from '../actionTypes'

function setCalendarRecipe (state, { recipe }) {
  const existing =
    state.allIds
    .filter(x => x !== recipe.id)
    .map(x => state[x])
    .filter(x => isSameDay(x.on, recipe.on))
    .find(x => x.recipe.id === recipe.recipe.id)

  if (existing) {
    // we remove the existing and replace with the pending uuid
    return {
      ...omit(state, existing.id),
      [recipe.id]: {
        ...recipe,
        count: existing.count + recipe.count,
      },
      allIds: state.allIds.filter(id => id !== existing.id).concat(recipe.id),
    }
  }

  return {
    ...state,
    [recipe.id]: recipe,
    allIds: uniq(state.allIds.concat(recipe.id)),
  }
}

function moveCalendarRecipe (state, action) {
  // if the same recipe already exists at the date:
  // - add the two counts
  // - remove the old recipe
  // else
  // - update the date of the recipe
  const moving = state[action.id]

  // getMerging(state,
  const existing =
    state.allIds
    .filter(x => x !== action.id)
    .map(x => state[x])
    .filter(x => isSameDay(x.on, action.on))
    .find(x => x.recipe.id === moving.recipe.id)

  if (existing) {
    return {
      ...omit(state, action.id),
      [existing.id]: {
        ...existing,
        count: existing.count + moving.count,
      },
      allIds: state.allIds.filter(id => id !== action.id),
    }
  }

  return {
    ...state,
    [action.id]: {
      ...state[action.id],
      on: action.on,
    }
  }
}

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
    return setCalendarRecipe(state, action)
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
  case MOVE_CALENDAR_RECIPE:
    return moveCalendarRecipe(state, action)
  case REPLACE_CALENDAR_RECIPE:
    return {
      ...omit(state, action.id),
      [action.recipe.id]: action.recipe,
      allIds: uniq(state.allIds.filter(id => id !== action.id).concat(action.recipe.id)),
    }
  default:
    return state
  }
}

export default calendar
