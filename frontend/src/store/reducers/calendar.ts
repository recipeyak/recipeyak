import { isAfter, isBefore, parseISO } from "date-fns"
import isSameDay from "date-fns/isSameDay"
import { isRight } from "fp-ts/lib/Either"
import { omit } from "lodash-es"
import { Cmd, Loop, loop } from "redux-loop"
import {
  ActionType,
  createAsyncAction,
  createStandardAction,
  getType,
} from "typesafe-actions"

import * as api from "@/api"
import { ITeam } from "@/store/reducers/teams"
import { IUser } from "@/store/reducers/user"
import {
  addingScheduledRecipeAsync,
  Dispatch,
  IAddingScheduledRecipeProps,
  IMoveScheduledRecipeProps,
  moveScheduledRecipe,
} from "@/store/thunks"
import { notUndefined } from "@/utils/general"
import { mapSuccessLike, Success, WebData } from "@/webdata"

export const fetchCalendarRecipes = createAsyncAction(
  "FETCH_CALENDAR_RECIPES_START",
  "FETCH_CALENDAR_RECIPES_SUCCESS",
  "FETCH_CALENDAR_RECIPES_FAILURE",
)<
  void,
  {
    readonly scheduledRecipes: readonly ICalRecipe[]
    readonly start: string
    readonly end: string
    readonly settings: {
      readonly syncEnabled: boolean
      readonly calendarLink: string
    }
  },
  void
>()
export const setCalendarRecipe = createStandardAction(
  "SET_CALENDAR_RECIPE",
)<ICalRecipe>()
export const deleteCalendarRecipe = createStandardAction(
  "DELETE_CALENDAR_RECIPE",
)<number>()
export const moveCalendarRecipe = createStandardAction("MOVE_CALENDAR_RECIPE")<{
  id: ICalRecipe["id"]
  to: string
}>()
export const replaceCalendarRecipe = createStandardAction(
  "REPLACE_CALENDAR_RECIPE",
)<{ id: ICalRecipe["id"]; recipe: ICalRecipe }>()

export const moveOrCreateCalendarRecipe = createStandardAction(
  "MOVE_OR_CREATE_CALENDAR_RECIPE",
)<IMoveScheduledRecipeProps>()

export const createCalendarRecipe = createStandardAction(
  "CREATE_CALENDAR_RECIPE",
)<IAddingScheduledRecipeProps>()

export const updateCalendarSettings = createAsyncAction(
  "UPDATE_CALENDAR_SETTINGS_START",
  "UPDATE_CALENDAR_SETTINGS_SUCCESS",
  "UPDATE_CALENDAR_SETTINGS_FAILURE",
)<
  { readonly teamID: number | "personal"; readonly syncEnabled: boolean },
  {
    readonly syncEnabled: boolean
    readonly calendarLink: string
  },
  {
    readonly syncEnabled: boolean
  }
>()

export async function updateCalendarSettingsAsync(
  {
    teamID,
    syncEnabled,
  }: {
    readonly teamID: number | "personal"
    readonly syncEnabled: boolean
  },
  dispatch: Dispatch,
) {
  const res = await api.updateCalendarSettings({
    teamID,
    data: { syncEnabled },
  })
  if (isRight(res)) {
    dispatch(updateCalendarSettings.success(res.right))
  } else {
    dispatch(updateCalendarSettings.failure({ syncEnabled: !syncEnabled }))
  }
}

export const regenerateCalendarLink = createAsyncAction(
  "REGENERATE_CALENDAR_LINK_START",
  "REGENERATE_CALENDAR_LINK_SUCCESS",
  "REGENERATE_CALENDAR_LINK_FAILURE",
)<
  { readonly teamID: number | "personal" },
  {
    readonly calendarLink: string
  },
  void
>()

export async function regenerateCalendarLinkAsync(
  teamID: number | "personal",
  dispatch: Dispatch,
) {
  const res = await api.generateCalendarLink({
    teamID,
  })
  if (isRight(res)) {
    dispatch(regenerateCalendarLink.success(res.right))
  } else {
    dispatch(regenerateCalendarLink.failure())
  }
}

export type CalendarActions =
  | ReturnType<typeof setCalendarRecipe>
  | ReturnType<typeof deleteCalendarRecipe>
  | ReturnType<typeof moveCalendarRecipe>
  | ReturnType<typeof replaceCalendarRecipe>
  | ActionType<typeof fetchCalendarRecipes>
  | ActionType<typeof moveOrCreateCalendarRecipe>
  | ActionType<typeof createCalendarRecipe>
  | ActionType<typeof updateCalendarSettings>
  | ActionType<typeof regenerateCalendarLink>

// TODO(sbdchd): this should be imported from the recipes reducer
export interface ICalRecipe {
  readonly id: number
  readonly count: number
  readonly on: string
  readonly created: string
  readonly team: ITeam["id"] | null
  readonly user: IUser["id"] | null
  readonly recipe: {
    readonly id: number
    readonly name: string
  }
}

export interface ICalendarState {
  readonly status: "success" | "failure" | "loading" | "initial" | "refetching"
  readonly byId: {
    readonly [key: number]: ICalRecipe | undefined
  }
  readonly settings: WebData<{
    readonly syncEnabled: boolean
    readonly calendarLink: string
  }>
}

export const initialState: ICalendarState = {
  byId: {},
  status: "initial",
  settings: undefined,
}

function byId<T extends { id: number }>(a: { [_: number]: T }, b: T) {
  return { ...a, [b.id]: b }
}

export const calendar = (
  state: ICalendarState = initialState,
  action: CalendarActions,
): ICalendarState | Loop<ICalendarState, CalendarActions> => {
  switch (action.type) {
    case getType(fetchCalendarRecipes.success):
      const byIdState = Object.values(state.byId)
        .filter(notUndefined)
        .filter(
          (value) =>
            isAfter(parseISO(value.on), parseISO(action.payload.end)) ||
            isBefore(parseISO(value.on), parseISO(action.payload.start)),
        )
        .reduce(byId, {})

      return {
        ...state,
        byId: {
          ...byIdState,
          ...action.payload.scheduledRecipes.reduce(byId, {}),
        },
        settings: Success(action.payload.settings),
        status: "success",
      }
    case getType(setCalendarRecipe): {
      const existing = getExistingRecipe({
        state,
        on: action.payload.on,
        from: action.payload,
      })

      if (existing) {
        // we remove the existing and replace with the pending uuid
        return {
          ...state,
          byId: {
            ...omit(state.byId, existing.id),
            [action.payload.id]: {
              ...action.payload,
              count: existing.count + action.payload.count,
            },
          },
        }
      }

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload,
        },
      }
    }
    case getType(deleteCalendarRecipe):
      return {
        ...state,
        byId: omit(state.byId, action.payload),
      }
    case getType(fetchCalendarRecipes.request): {
      if (state.status === "initial") {
        return {
          ...state,
          status: "loading",
        }
      }
      if (state.status === "success") {
        return {
          ...state,
          status: "refetching",
        }
      }
      return state
    }
    case getType(fetchCalendarRecipes.failure):
      return {
        ...state,
        status: "failure",
      }
    case getType(moveCalendarRecipe): {
      // if the same recipe already exists at the date:
      // - add the two counts
      // - remove the old recipe
      // else
      // - update the date of the recipe
      const moving = state.byId[action.payload.id]

      const isSameTeamAndDay = (r: ICalRecipe | undefined): r is ICalRecipe => {
        if (moving == null || r == null) {
          return false
        }
        return (
          r.id !== action.payload.id &&
          isSameDay(new Date(r.on), new Date(action.payload.to)) &&
          r.team === moving.team &&
          r.user === moving.user
        )
      }

      const existing =
        notUndefined(moving) &&
        Object.values(state.byId)
          .filter(isSameTeamAndDay)
          .find((r) => r.recipe.id === moving.recipe.id)

      if (existing && notUndefined(moving)) {
        return {
          ...state,
          byId: {
            ...omit(state.byId, action.payload.id),
            [existing.id]: {
              ...existing,
              count: existing.count + moving.count,
            },
          },
        }
      }

      const cal = state.byId[action.payload.id]
      if (cal == null) {
        return state
      }
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...cal,
            on: action.payload.to,
          },
        },
      }
    }
    case getType(updateCalendarSettings.request):
      return loop(
        {
          ...state,
          settings: mapSuccessLike(state.settings, (s) => ({
            ...s,
            ...action.payload,
          })),
        },
        Cmd.run(updateCalendarSettingsAsync, {
          args: [action.payload, Cmd.dispatch],
        }),
      )
    case getType(updateCalendarSettings.success):
      return {
        ...state,
        settings: Success(action.payload),
      }
    case getType(updateCalendarSettings.failure):
      return {
        ...state,
        settings: mapSuccessLike(state.settings, (s) => ({
          ...s,
          ...action.payload,
        })),
      }
    case getType(regenerateCalendarLink.request):
      return loop(
        state,
        Cmd.run(regenerateCalendarLinkAsync, {
          args: [action.payload.teamID, Cmd.dispatch],
        }),
      )
    case getType(regenerateCalendarLink.success):
      return {
        ...state,
        settings: mapSuccessLike(state.settings, (s) => ({
          ...s,
          ...action.payload,
        })),
      }
    case getType(regenerateCalendarLink.failure):
      return state
    case getType(moveOrCreateCalendarRecipe):
      return loop(
        state,
        Cmd.run(moveScheduledRecipe, {
          args: [Cmd.dispatch, Cmd.getState, action.payload],
        }),
      )
    case getType(createCalendarRecipe):
      return loop(
        state,
        Cmd.run(addingScheduledRecipeAsync, {
          args: [Cmd.dispatch, Cmd.getState, action.payload],
        }),
      )
    case getType(replaceCalendarRecipe):
      return {
        ...state,
        byId: {
          ...omit(state.byId, action.payload.id),
          [action.payload.recipe.id]: action.payload.recipe,
        },
      }
    default:
      return state
  }
}

export default calendar

export const getAllCalRecipes = (state: ICalendarState): ICalRecipe[] =>
  Object.values(state.byId).filter(notUndefined)

export const getTeamRecipes = (state: ICalendarState): ICalRecipe[] =>
  getAllCalRecipes(state).filter((recipe) => recipe.team != null)

export const getPersonalRecipes = (state: ICalendarState): ICalRecipe[] =>
  getAllCalRecipes(state).filter((recipe) => recipe.team == null)

function haveSameTeam(a: ICalRecipe, b: ICalRecipe): boolean {
  return a.team === b.team && a.user === b.user
}

interface IGetExistingRecipeProps {
  readonly state: ICalendarState
  readonly on: Date | string
  // recipe that is going to be moved
  readonly from: ICalRecipe
}

export const getExistingRecipe = ({
  state,
  on,
  from,
}: IGetExistingRecipeProps) =>
  getAllCalRecipes(state).find(
    (x) =>
      isSameDay(new Date(x.on), new Date(on)) &&
      haveSameTeam(x, from) &&
      x.id !== from.id &&
      x.recipe.id === from.recipe.id,
  )
