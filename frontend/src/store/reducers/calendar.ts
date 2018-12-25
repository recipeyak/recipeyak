import { uniq, omit } from "lodash"
import isSameDay from "date-fns/is_same_day"

import { action } from "typesafe-actions";

const SET_CALENDAR_RECIPES = "SET_CALENDAR_RECIPES"
const SET_CALENDAR_RECIPE = "SET_CALENDAR_RECIPE"
const DELETE_CALENDAR_RECIPE = "DELETE_CALENDAR_RECIPE"
const SET_CALENDAR_ERROR = "SET_CALENDAR_ERROR"
const SET_CALENDAR_LOADING = "SET_CALENDAR_LOADING"
const MOVE_CALENDAR_RECIPE = "MOVE_CALENDAR_RECIPE"
const REPLACE_CALENDAR_RECIPE = "REPLACE_CALENDAR_RECIPE"


export const setCalendarLoading = (loading: boolean) => action(SET_CALENDAR_LOADING, loading)

export const setCalendarError = (error: boolean) => action(SET_CALENDAR_ERROR, error)

export const setCalendarRecipe = (recipe: ICalRecipe) => action(SET_CALENDAR_RECIPE, recipe)

export const deleteCalendarRecipe = (id: string | number) => action(DELETE_CALENDAR_RECIPE, id)

export const moveCalendarRecipe = (id: ICalRecipe["id"], to: string) => action(
  MOVE_CALENDAR_RECIPE,
  {
    id,
    on: to
  }
)




export const setCalendarRecipes = (recipes: ICalRecipe[]) => action( SET_CALENDAR_RECIPES, recipes )

export const replaceCalendarRecipe = (
  id: ICalRecipe["id"],
  recipe: ICalRecipe
) => action(
  REPLACE_CALENDAR_RECIPE, {
  id,
  recipe
})



export type CalendarActions =
| ReturnType<typeof setCalendarLoading>
| ReturnType<typeof setCalendarError>
| ReturnType<typeof setCalendarRecipe >
| ReturnType<typeof deleteCalendarRecipe >
| ReturnType<typeof moveCalendarRecipe >
| ReturnType<typeof setCalendarRecipes >
| ReturnType<typeof replaceCalendarRecipe >



function setCalendarRecipeState(state: ICalendarState, { payload: recipe }:  ReturnType<typeof setCalendarRecipe > ) { const existing = state.allIds
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
      allIds: state.allIds.filter(id => id !== existing.id).concat(toInt(recipe.id))
    }
  }

  return {
    ...state,
    [recipe.id]: recipe,
    allIds: uniq(state.allIds.concat(toInt(recipe.id)))
  }
}

function moveCalendarRecipeState(state: ICalendarState, action:  ReturnType<typeof moveCalendarRecipe > ) {
  // if the same recipe already exists at the date:
  // - add the two counts
  // - remove the old recipe
  // else
  // - update the date of the recipe
  const moving = state[toInt(action.payload.id)]

  const existing = state.allIds
    .filter(x => x !== action.payload.id)
    .map(x => state[x])
    .filter(x => isSameDay(x.on, action.payload.on))
    .filter(x => x.team === moving.team && x.user === moving.user)
    .find(x => x.recipe.id === moving.recipe.id)

  if (existing) {
    return {
      ...omit(state, action.payload.id),
      [existing.id]: {
        ...existing,
        count: existing.count + moving.count
      },
      allIds: state.allIds.filter(id => id !== action.payload.id)
    }
  }

  return {
    ...state,
    [action.payload.id]: {
      ...state[toInt(action.payload.id)],
      on: action.payload.on
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

function toInt(x: string | number): number {
  return parseInt(String(x), 10)
}

export const calendar = (
  state: ICalendarState = initialState,
  action: CalendarActions
): ICalendarState => {
  switch (action.type) {
    case SET_CALENDAR_RECIPES:
      return {
        ...state,
        ...action.payload.reduce(
          (a, b) => ({ ...a, [b.id]: b }),
          {}
        ),
        allIds: uniq(
          state.allIds.concat(action.payload.map(x => toInt(x.id)))
        )
      }
    case SET_CALENDAR_RECIPE:
      return setCalendarRecipeState(state, action)
    case DELETE_CALENDAR_RECIPE:
      return {
        ...omit(state, action.payload),
        allIds: state.allIds.filter(id => id !== action.payload)
      }
    case SET_CALENDAR_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    case SET_CALENDAR_ERROR:
      return {
        ...state,
        error: action.payload
      }
    case MOVE_CALENDAR_RECIPE:
      return moveCalendarRecipeState(state, action)
    case REPLACE_CALENDAR_RECIPE:
      return {
        ...omit(state, action.payload.id),
        [action.payload.recipe.id]: action.payload.recipe,
        allIds: uniq(
          state.allIds.filter(id => id !== action.payload.id).concat(toInt(action.payload.recipe.id))
        )
      }
    default:
      return state
  }
}

export default calendar
