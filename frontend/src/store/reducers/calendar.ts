import { uniq, omit } from "lodash"
import isSameDay from "date-fns/is_same_day"

import {
  action as act,
  createAsyncAction,
  ActionType,
  getType
} from "typesafe-actions"
import { RootState } from "@/store/store"

const SET_CALENDAR_RECIPE = "SET_CALENDAR_RECIPE"
const DELETE_CALENDAR_RECIPE = "DELETE_CALENDAR_RECIPE"
const MOVE_CALENDAR_RECIPE = "MOVE_CALENDAR_RECIPE"
const REPLACE_CALENDAR_RECIPE = "REPLACE_CALENDAR_RECIPE"

export const fetchCalendarRecipes = createAsyncAction(
  "FETCH_CALENDAR_RECIPES_START",
  "FETCH_CALENDAR_RECIPES_SUCCESS",
  "FETCH_CALENDAR_RECIPES_FAILURE"
)<void, ICalRecipe[], void>()

export const setCalendarRecipe = (recipe: ICalRecipe) =>
  act(SET_CALENDAR_RECIPE, recipe)

export const deleteCalendarRecipe = (id: number) =>
  act(DELETE_CALENDAR_RECIPE, id)

export const moveCalendarRecipe = (id: ICalRecipe["id"], to: string) =>
  act(MOVE_CALENDAR_RECIPE, {
    id,
    on: to
  })

export const replaceCalendarRecipe = (
  id: ICalRecipe["id"],
  recipe: ICalRecipe
) =>
  act(REPLACE_CALENDAR_RECIPE, {
    id,
    recipe
  })

export type CalendarActions =
  | ReturnType<typeof setCalendarRecipe>
  | ReturnType<typeof deleteCalendarRecipe>
  | ReturnType<typeof moveCalendarRecipe>
  | ReturnType<typeof replaceCalendarRecipe>
  | ActionType<typeof fetchCalendarRecipes>

// TODO(sbdchd): this should be imported from the recipes reducer
export interface ICalRecipe {
  readonly id: number
  readonly count: number
  readonly on: string
  readonly team?: unknown
  readonly user: unknown
  readonly recipe: {
    readonly id: number
    readonly name: string
  }
}

export interface ICalendarState {
  readonly allIds: ICalRecipe["id"][]
  readonly loading: boolean
  readonly error: boolean
  readonly byId: {
    readonly [key: number]: ICalRecipe
  }
}

export const initialState: ICalendarState = {
  allIds: [],
  byId: {},
  loading: false,
  error: false
}

export const calendar = (
  state: ICalendarState = initialState,
  action: CalendarActions
): ICalendarState => {
  switch (action.type) {
    case getType(fetchCalendarRecipes.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          ...action.payload.reduce((a, b) => ({ ...a, [b.id]: b }), {})
        },
        allIds: uniq(state.allIds.concat(action.payload.map(x => x.id)))
      }
    case SET_CALENDAR_RECIPE: {
      const existing = state.allIds
        .filter(x => x !== action.payload.id)
        .map(x => state.byId[x])
        .filter(x => isSameDay(x.on, action.payload.on))
        .find(x => x.recipe.id === action.payload.recipe.id)

      if (existing) {
        // we remove the existing and replace with the pending uuid
        return {
          ...state,
          byId: {
            ...omit(state.byId, existing.id),
            [action.payload.id]: {
              ...action.payload,
              count: existing.count + action.payload.count
            }
          },
          allIds: state.allIds
            .filter(id => id !== existing.id)
            .concat(action.payload.id)
        }
      }

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload
        },
        allIds: uniq(state.allIds.concat(action.payload.id))
      }
    }

    case DELETE_CALENDAR_RECIPE:
      return {
        ...state,
        byId: omit(state.byId, action.payload),
        allIds: state.allIds.filter(id => id !== action.payload)
      }
    case getType(fetchCalendarRecipes.request):
      return {
        ...state,
        loading: true,
        error: false
      }
    case getType(fetchCalendarRecipes.failure):
      return {
        ...state,
        error: true
      }
    case MOVE_CALENDAR_RECIPE: {
      // if the same recipe already exists at the date:
      // - add the two counts
      // - remove the old recipe
      // else
      // - update the date of the recipe
      const moving = state.byId[action.payload.id]

      const existing = state.allIds
        .filter(x => x !== action.payload.id)
        .map(x => state.byId[x])
        .filter(x => isSameDay(x.on, action.payload.on))
        .filter(x => x.team === moving.team && x.user === moving.user)
        .find(x => x.recipe.id === moving.recipe.id)

      if (existing) {
        return {
          ...state,
          byId: {
            ...omit(state.byId, action.payload.id),
            [existing.id]: {
              ...existing,
              count: existing.count + moving.count
            }
          },
          allIds: state.allIds.filter(id => id !== action.payload.id)
        }
      }

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            on: action.payload.on
          }
        }
      }
    }
    case REPLACE_CALENDAR_RECIPE:
      return {
        ...state,
        byId: {
          ...omit(state.byId, action.payload.id),
          [action.payload.recipe.id]: action.payload.recipe
        },
        allIds: uniq(
          state.allIds
            .filter(id => id !== action.payload.id)
            .concat(action.payload.recipe.id)
        )
      }
    default:
      return state
  }
}

export default calendar

export const getCalRecipeById = (
  state: RootState,
  id: ICalRecipe["id"]
): ICalRecipe => state.calendar.byId[id]

export const getAllCalRecipes = (state: RootState): ICalRecipe[] =>
  state.calendar.allIds.map(id => getCalRecipeById(state, id))

export const getTeamRecipes = (state: RootState): ICalRecipe[] =>
  getAllCalRecipes(state).filter(recipe => recipe.team != null)

export const getPersonalRecipes = (state: RootState): ICalRecipe[] =>
  getAllCalRecipes(state).filter(recipe => recipe.team == null)
