import raven from "raven-js"
import {
  ActionType,
  createAsyncAction,
  createStandardAction,
  getType,
} from "typesafe-actions"

import { WebData } from "@/webdata"

export const updateScheduleTeamID =
  createStandardAction("SET_TEAM_ID")<IUserState["scheduleTeamID"]>()

export const setUserLoggedIn =
  createStandardAction("SET_USER_LOGGED_IN")<IUserState["loggedIn"]>()
export const fetchUser = createAsyncAction(
  "FETCH_USER_START",
  "FETCH_USER_SUCCESS",
  "FETCH_USER_FAILURE",
)<void, IUser, void>()
export const updateEmail = createAsyncAction(
  "UPDATE_EMAIL_START",
  "UPDATE_EMAIL_SUCCESS",
  "UPDATE_EMAIL_FAILURE",
)<void, IUser, void>()

export const logoutSessionById = createAsyncAction(
  "LOGOUT_SESSION_BY_ID_REQUEST",
  "LOGOUT_SESSION_BY_ID_SUCCESS",
  "LOGOUT_SESSION_BY_ID_FAILURE",
)<ISession["id"], ISession["id"], ISession["id"]>()

export type UserActions =
  | ReturnType<typeof setUserLoggedIn>
  | ReturnType<typeof updateScheduleTeamID>
  | ActionType<typeof fetchUser>
  | ActionType<typeof updateEmail>
  | ActionType<typeof logoutSessionById>

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
  readonly loading: boolean
  readonly error: boolean
  readonly hasUsablePassword: boolean
  readonly scheduleTeamID: number | null
  readonly updatingEmail: boolean
  readonly sessions: WebData<ReadonlyArray<ISession>>
  readonly loggingOutAllSessionsStatus: LoggingOutStatus
}

const initialState: IUserState = {
  id: null,
  loggedIn: false,
  avatarURL: "",
  email: "",
  name: "",
  loading: false,
  error: false,
  hasUsablePassword: false,
  scheduleTeamID: null,
  updatingEmail: false,
  sessions: undefined,
  loggingOutAllSessionsStatus: LoggingOutStatus.Initial,
}

export const user = (
  state: IUserState = initialState,
  action: UserActions,
): IUserState => {
  switch (action.type) {
    case getType(updateScheduleTeamID):
      return { ...state, scheduleTeamID: action.payload }
    case getType(setUserLoggedIn):
      return { ...state, loggedIn: action.payload }
    case getType(updateEmail.request):
      return { ...state, updatingEmail: true }
    case getType(updateEmail.failure):
      return { ...state, updatingEmail: false }
    case getType(fetchUser.request):
      return { ...state, loading: true, error: false }
    case getType(fetchUser.failure):
      return { ...state, loading: false, error: true }
    case getType(updateEmail.success):
    case getType(fetchUser.success):
      raven.setUserContext({
        ...{
          email: state.email,
          id: state.id,
        },
        email: action.payload.email,
        id: action.payload.id,
      })
      return {
        ...state,
        loading: false,
        loggedIn: true,
        email: action.payload.email,
        name: action.payload.name,
        avatarURL: action.payload.avatar_url,
        id: action.payload.id,
        scheduleTeamID: action.payload.schedule_team,
        updatingEmail: false,
      }
    default:
      return state
  }
}

export default user
