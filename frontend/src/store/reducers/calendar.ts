import { isRight } from "fp-ts/lib/Either"
import { Cmd, Loop, loop } from "redux-loop"
import { ActionType, createAsyncAction, getType } from "typesafe-actions"

import * as api from "@/api"
import { ITeam } from "@/store/reducers/teams"
import { IUser } from "@/store/reducers/user"
import { Dispatch } from "@/store/thunks"
import { notUndefined } from "@/utils/general"
import { mapSuccessLike, Success, WebData } from "@/webdata"

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
  | ActionType<typeof updateCalendarSettings>
  | ActionType<typeof regenerateCalendarLink>

// TODO(sbdchd): this should be imported from the recipes reducer
export interface ICalRecipe {
  readonly id: number
  readonly on: string
  readonly created: string
  readonly createdBy: {
    readonly id: number | string
    readonly name: string
    readonly avatar_url: string
  } | null
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

export const calendar = (
  state: ICalendarState = initialState,
  action: CalendarActions,
): ICalendarState | Loop<ICalendarState, CalendarActions> => {
  switch (action.type) {
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
