import { uniq, omit } from "lodash"
import isSameDay from "date-fns/is_same_day"

import t from "../actionTypes"
import { AnyAction } from "redux"

function setCalendarRecipe(state: ICalendarState, { recipe }: AnyAction) {
  const existing = state.allIds
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
        count: existing.count + recipe.count
      },
      allIds: state.allIds.filter(id => id !== existing.id).concat(recipe.id)
    }
  }

  return {
    ...state,
    [recipe.id]: recipe,
    allIds: uniq(state.allIds.concat(recipe.id))
  }
}

function moveCalendarRecipe(state: ICalendarState, action: AnyAction) {
  // if the same recipe already exists at the date:
  // - add the two counts
  // - remove the old recipe
  // else
  // - update the date of the recipe
  const moving = state[action.id]

  const existing = state.allIds
    .filter(x => x !== action.id)
    .map(x => state[x])
    .filter(x => isSameDay(x.on, action.on))
    .filter(x => x.team === moving.team && x.user === moving.user)
    .find(x => x.recipe.id === moving.recipe.id)

  if (existing) {
    return {
      ...omit(state, action.id),
      [existing.id]: {
        ...existing,
        count: existing.count + moving.count
      },
      allIds: state.allIds.filter(id => id !== action.id)
    }
  }

  return {
    ...state,
    [action.id]: {
      ...state[action.id],
      on: action.on
    }
  }
}

// TODO(sbdchd): this should be imported from the recipes reducer
export interface ICalRecipe {
  readonly id: number | string
  readonly count: number
  readonly on: string
  readonly team?: unknown
  readonly user: unknown
  readonly recipe: {
    readonly id: number | string
  }
}

export interface ICalendarState {
  readonly allIds: number[]
  readonly loading: boolean
  readonly error: boolean
  readonly [key: number]: ICalRecipe
}

export const initialState: ICalendarState = {
  allIds: [],
  loading: false,
  error: false
}

export const calendar = (
  state: ICalendarState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case t.SET_CALENDAR_RECIPES:
      return {
        ...state,
        ...action.recipes.reduce(
          (a: unknown, b: ICalRecipe) => ({ ...a, [b.id]: b }),
          {}
        ),
        allIds: uniq(
          state.allIds.concat(action.recipes.map((x: ICalRecipe) => x.id))
        )
      }
    case t.SET_CALENDAR_RECIPE:
      return setCalendarRecipe(state, action)
    case t.DELETE_CALENDAR_RECIPE:
      return {
        ...omit(state, action.id),
        allIds: state.allIds.filter(id => id !== action.id)
      }
    case t.SET_CALENDAR_LOADING:
      return {
        ...state,
        loading: action.loading
      }
    case t.SET_CALENDAR_ERROR:
      return {
        ...state,
        error: action.error
      }
    case t.MOVE_CALENDAR_RECIPE:
      return moveCalendarRecipe(state, action)
    case t.REPLACE_CALENDAR_RECIPE:
      return {
        ...omit(state, action.id),
        [action.recipe.id]: action.recipe,
        allIds: uniq(
          state.allIds.filter(id => id !== action.id).concat(action.recipe.id)
        )
      }
    default:
      return state
  }
}

export default calendar
