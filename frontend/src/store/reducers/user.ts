import raven from "raven-js"
import {
  createAsyncAction,
  createStandardAction,
  ActionType,
  getType,
} from "typesafe-actions"
import {
  WebData,
  Success,
  Failure,
  HttpErrorKind,
  toLoading,
  mapSuccessLike,
} from "@/webdata"
import { login, AuthActions } from "@/store/reducers/auth"

// TODO(chdsbd): Replace usage with fetchUser#success. Update user reducer.
export const logOut = createAsyncAction(
  "LOGOUT_START",
  "LOGOUT_SUCCESS",
  "LOGOUT_FAILURE",
)<void, void, void>()

export const updateRecipeTeamID =
  createStandardAction("SET_TEAM_ID")<IUserState["recipeTeamID"]>()
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

export const fetchSessions = createAsyncAction(
  "FETCH_SESSIONS_REQUEST",
  "FETCH_SESSIONS_SUCCESS",
  "FETCH_SESSIONS_FAILURE",
)<void, ReadonlyArray<ISession>, void>()

export const logoutSessionById = createAsyncAction(
  "LOGOUT_SESSION_BY_ID_REQUEST",
  "LOGOUT_SESSION_BY_ID_SUCCESS",
  "LOGOUT_SESSION_BY_ID_FAILURE",
)<ISession["id"], ISession["id"], ISession["id"]>()

export const logoutAllSessions = createAsyncAction(
  "LOGOUT_ALL_SESSIONS_REQUEST",
  "LOGOUT_ALL_SESSIONS_SUCCESS",
  "LOGOUT_ALL_SESSIONS_FAILURE",
)<void, void, void>()

export type UserActions =
  | ActionType<typeof logOut>
  | ReturnType<typeof setUserLoggedIn>
  | ReturnType<typeof updateRecipeTeamID>
  | ReturnType<typeof updateScheduleTeamID>
  | ActionType<typeof fetchUser>
  | ActionType<typeof updateEmail>
  | ActionType<typeof fetchSessions>
  | ActionType<typeof logoutSessionById>
  | ActionType<typeof logoutAllSessions>

// User state from API
export interface IUser {
  readonly avatar_url: string
  readonly email: string
  readonly id: number
  readonly has_usable_password?: boolean
  readonly dark_mode_enabled: boolean
  readonly selected_team: number | null
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
  readonly loggingOut?: LoggingOutStatus
}

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
  readonly loading: boolean
  readonly error: boolean
  readonly loggingOut: boolean
  readonly darkMode: boolean
  readonly hasUsablePassword: boolean
  // ID of currently focused team. null if using personal team.
  readonly recipeTeamID: number | null
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
  loading: false,
  error: false,
  loggingOut: false,
  darkMode: false,
  hasUsablePassword: false,
  recipeTeamID: null,
  scheduleTeamID: null,
  updatingEmail: false,
  sessions: undefined,
  loggingOutAllSessionsStatus: LoggingOutStatus.Initial,
}

export const user = (
  state: IUserState = initialState,
  action: UserActions | AuthActions,
): IUserState => {
  switch (action.type) {
    case getType(logOut.request):
      raven.setUserContext()
      return { ...state, loggingOut: true }
    case getType(logOut.success):
      return { ...state, loggingOut: false, loggedIn: false }
    case getType(logOut.failure):
      return { ...state, loggingOut: false }

    case getType(fetchSessions.request):
      return {
        ...state,
        sessions: toLoading(state.sessions),
      }
    case getType(fetchSessions.success):
      return {
        ...state,
        sessions: Success(action.payload),
      }
    case getType(fetchSessions.failure):
      return {
        ...state,
        sessions: Failure(HttpErrorKind.other),
      }
    case getType(logoutSessionById.request):
      return {
        ...state,
        sessions: mapSuccessLike(state.sessions, (data) =>
          data.map((s) => {
            if (s.id === action.payload) {
              return { ...s, loggingOut: LoggingOutStatus.Loading }
            }
            return s
          }),
        ),
      }
    case getType(logoutSessionById.success):
      return {
        ...state,
        sessions: mapSuccessLike(state.sessions, (data) =>
          data.filter((s) => s.id !== action.payload),
        ),
      }
    case getType(logoutSessionById.failure):
      return {
        ...state,
        sessions: mapSuccessLike(state.sessions, (data) =>
          data.map((s) => {
            if (s.id === action.payload) {
              return { ...s, loggingOut: LoggingOutStatus.Failure }
            }
            return s
          }),
        ),
      }

    case getType(logoutAllSessions.request):
      return {
        ...state,
        loggingOutAllSessionsStatus: LoggingOutStatus.Loading,
      }
    case getType(logoutAllSessions.success):
      return {
        ...state,
        sessions: mapSuccessLike(state.sessions, (data) =>
          data.filter((s) => s.current),
        ),
        loggingOutAllSessionsStatus: LoggingOutStatus.Initial,
      }
    case getType(logoutAllSessions.failure):
      return {
        ...state,
        loggingOutAllSessionsStatus: LoggingOutStatus.Failure,
      }
    case getType(updateRecipeTeamID):
      return { ...state, recipeTeamID: action.payload }
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
    case getType(login.success):
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
        hasUsablePassword: !!action.payload.has_usable_password,
        email: action.payload.email,
        avatarURL: action.payload.avatar_url,
        id: action.payload.id,
        darkMode: action.payload.dark_mode_enabled,
        recipeTeamID: action.payload.selected_team,
        scheduleTeamID: action.payload.schedule_team,
        updatingEmail: false,
      }
    default:
      return state
  }
}

export default user
