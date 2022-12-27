import raven from "raven-js"
import { ActionType, createStandardAction, getType } from "typesafe-actions"

import { Action } from "@/store/store"

export const updateScheduleTeamID =
  createStandardAction("SET_TEAM_ID")<IUserState["scheduleTeamID"]>()

export const setUserLoggedIn =
  createStandardAction("SET_USER_LOGGED_IN")<IUserState["loggedIn"]>()

export const cacheUserInfo = createStandardAction("FETCH_USER_SUCCESS")<IUser>()

export type UserActions =
  | ReturnType<typeof setUserLoggedIn>
  | ReturnType<typeof updateScheduleTeamID>
  | ActionType<typeof cacheUserInfo>

// User state from API
export interface IUser {
  readonly avatar_url: string
  readonly email: string
  readonly name: string
  readonly id: number
  readonly dark_mode_enabled: boolean
  readonly schedule_team: number | null
}

export interface ISession {
  readonly id: string
  readonly device: {
    readonly kind: "mobile" | "desktop" | null
    readonly os: string | null
    readonly browser: string | null
  }
  readonly last_activity: string
  readonly ip: string
  readonly current: boolean
}

// eslint-disable-next-line no-restricted-syntax
export const enum LoggingOutStatus {
  Initial,
  Loading,
  Failure,
}

export interface IUserState {
  readonly id: null | number
  readonly loggedIn: boolean
  readonly avatarURL: string
  readonly email: string
  readonly name: string
  readonly scheduleTeamID: number | null
}

const initialState: IUserState = {
  id: null,
  loggedIn: false,
  avatarURL: "",
  email: "",
  name: "",
  scheduleTeamID: null,
}

export const user = (
  state: IUserState = initialState,
  action: Action,
): IUserState => {
  switch (action.type) {
    case getType(updateScheduleTeamID):
      return { ...state, scheduleTeamID: action.payload }
    case getType(setUserLoggedIn):
      return { ...state, loggedIn: action.payload }
    case getType(cacheUserInfo):
      raven.setUserContext({
        ...{
          email: state.email,
          id: state.id,
        },
        email: action.payload.email,
        id: action.payload.id,
      })
      return {
        // TODO: we can probably trim this down, we might only need the loggedIn attr
        ...state,
        loggedIn: true,
        email: action.payload.email,
        name: action.payload.name,
        avatarURL: action.payload.avatar_url,
        id: action.payload.id,
        scheduleTeamID: action.payload.schedule_team,
      }
    default:
      return state
  }
}

export default user
