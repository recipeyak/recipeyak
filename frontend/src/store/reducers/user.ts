import { setDarkModeClass } from "@/sideEffects"

import raven from "raven-js"
import {
  createAsyncAction,
  createStandardAction,
  ActionType,
  getType
} from "typesafe-actions"
import { IRecipe } from "@/store/reducers/recipes"
import {
  WebData,
  Success,
  Failure,
  HttpErrorKind,
  toLoading,
  mapSuccessLike
} from "@/webdata"
import { login, AuthActions } from "@/store/reducers/auth"

export const fetchUserStats = createAsyncAction(
  "FETCH_USER_STATS_START",
  "FETCH_USER_STATS_SUCCESS",
  "FETCH_USER_STATS_FAILURE"
)<void, IUserStats, void>()

// TODO(chdsbd): Replace usage with fetchUser#success. Update user reducer.
export const logOut = createAsyncAction(
  "LOGOUT_START",
  "LOGOUT_SUCCESS",
  "LOGOUT_FAILURE"
)<void, void, void>()

export const updateTeamID = createStandardAction("SET_TEAM_ID")<
  IUserState["teamID"]
>()
export const setSocialConnections = createStandardAction(
  "SET_SOCIAL_ACCOUNT_CONNECTIONS"
)<ISocialConnection[]>()
export const setSocialConnection = createStandardAction(
  "SET_SOCIAL_ACCOUNT_CONNECTION"
)<{ provider: SocialProvider; val: unknown }>()
export const setUserLoggedIn = createStandardAction("SET_USER_LOGGED_IN")<
  IUserState["loggedIn"]
>()
export const fetchUser = createAsyncAction(
  "FETCH_USER_START",
  "FETCH_USER_SUCCESS",
  "FETCH_USER_FAILURE"
)<void, IUser, void>()
export const toggleDarkMode = createStandardAction("TOGGLE_DARK_MODE")()
export const updateEmail = createAsyncAction(
  "UPDATE_EMAIL_START",
  "UPDATE_EMAIL_SUCCESS",
  "UPDATE_EMAIL_FAILURE"
)<void, IUser, void>()

export const fetchSessions = createAsyncAction(
  "FETCH_SESSIONS_REQUEST",
  "FETCH_SESSIONS_SUCCESS",
  "FETCH_SESSIONS_FAILURE"
)<void, ReadonlyArray<ISession>, void>()

export const logoutSessionById = createAsyncAction(
  "LOGOUT_SESSION_BY_ID_REQUEST",
  "LOGOUT_SESSION_BY_ID_SUCCESS",
  "LOGOUT_SESSION_BY_ID_FAILURE"
)<ISession["id"], ISession["id"], ISession["id"]>()

export const logoutAllSessions = createAsyncAction(
  "LOGOUT_ALL_SESSIONS_REQUEST",
  "LOGOUT_ALL_SESSIONS_SUCCESS",
  "LOGOUT_ALL_SESSIONS_FAILURE"
)<void, void, void>()

export type UserActions =
  | ActionType<typeof logOut>
  | ReturnType<typeof setUserLoggedIn>
  | ReturnType<typeof updateTeamID>
  | ReturnType<typeof setSocialConnections>
  | ReturnType<typeof setSocialConnection>
  | ActionType<typeof fetchUser>
  | ReturnType<typeof toggleDarkMode>
  | ActionType<typeof updateEmail>
  | ActionType<typeof fetchUserStats>
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
}

export type SocialProvider = "github" | "gitlab"

// API response
export interface ISocialConnection {
  readonly id: number | null
  readonly provider: SocialProvider
  readonly uid?: string
  readonly last_login?: string
  readonly date_joined?: string
}

export interface ISocialAccountsState {
  readonly github: number | null
  readonly gitlab: number | null
}

export interface IUserStats {
  readonly most_added_recipe: IRecipe | null
  readonly new_recipes_last_week: number
  readonly total_recipe_edits: number
  readonly date_joined?: string
  readonly total_user_recipes: number
  readonly recipes_added_by_month: IRecipe[]
  readonly total_recipes_added_last_month_by_all_users: number
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
  Failure
}

export interface IUserState {
  readonly id: null | number
  readonly loggedIn: boolean
  readonly avatarURL: string
  readonly email: string
  readonly loading: boolean
  readonly error: boolean
  readonly stats: WebData<IUserStats>
  readonly loggingOut: boolean
  readonly darkMode: boolean
  readonly hasUsablePassword: boolean
  readonly socialAccountConnections: ISocialAccountsState
  // ID of currently focused team. null if using personal team.
  readonly teamID: number | null
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
  stats: undefined,
  loggingOut: false,
  darkMode: false,
  hasUsablePassword: false,
  socialAccountConnections: {
    github: null,
    gitlab: null
  },
  teamID: null,
  updatingEmail: false,
  sessions: undefined,
  loggingOutAllSessionsStatus: LoggingOutStatus.Initial
}

export const user = (
  state: IUserState = initialState,
  action: UserActions | AuthActions
): IUserState => {
  switch (action.type) {
    case getType(fetchUserStats.success):
      return { ...state, stats: Success(action.payload) }
    case getType(fetchUserStats.request): {
      return {
        ...state,
        stats: toLoading(state.stats)
      }
    }
    case getType(fetchUserStats.failure):
      return { ...state, stats: Failure(HttpErrorKind.other) }
    case getType(logOut.request):
      raven.setUserContext()
      return { ...state, loggingOut: true }
    case getType(logOut.success):
      return { ...state, loggingOut: false, loggedIn: false }
    case getType(logOut.failure):
      return { ...state, loggingOut: false }
    case getType(setSocialConnections):
      return {
        ...state,
        socialAccountConnections: action.payload.reduce(
          (acc, { provider, id }) => ({ ...acc, [provider]: id }),
          state.socialAccountConnections
        )
      }
    case getType(setSocialConnection):
      return {
        ...state,
        socialAccountConnections: {
          ...state.socialAccountConnections,
          [action.payload.provider]: action.payload.val
        }
      }
    case getType(fetchSessions.request):
      return {
        ...state,
        sessions: toLoading(state.sessions)
      }
    case getType(fetchSessions.success):
      return {
        ...state,
        sessions: Success(action.payload)
      }
    case getType(fetchSessions.failure):
      return {
        ...state,
        sessions: Failure(HttpErrorKind.other)
      }
    case getType(logoutSessionById.request):
      return {
        ...state,
        sessions: mapSuccessLike(state.sessions, data =>
          data.map(s => {
            if (s.id === action.payload) {
              return { ...s, loggingOut: LoggingOutStatus.Loading }
            }
            return s
          })
        )
      }
    case getType(logoutSessionById.success):
      return {
        ...state,
        sessions: mapSuccessLike(state.sessions, data =>
          data.filter(s => s.id !== action.payload)
        )
      }
    case getType(logoutSessionById.failure):
      return {
        ...state,
        sessions: mapSuccessLike(state.sessions, data =>
          data.map(s => {
            if (s.id === action.payload) {
              return { ...s, loggingOut: LoggingOutStatus.Failure }
            }
            return s
          })
        )
      }

    case getType(logoutAllSessions.request):
      return {
        ...state,
        loggingOutAllSessionsStatus: LoggingOutStatus.Loading
      }
    case getType(logoutAllSessions.success):
      return {
        ...state,
        sessions: mapSuccessLike(state.sessions, data =>
          data.filter(s => s.current)
        ),
        loggingOutAllSessionsStatus: LoggingOutStatus.Initial
      }
    case getType(logoutAllSessions.failure):
      return {
        ...state,
        loggingOutAllSessionsStatus: LoggingOutStatus.Failure
      }
    case getType(updateTeamID):
      return { ...state, teamID: action.payload }
    case getType(setUserLoggedIn):
      return { ...state, loggedIn: action.payload }
    case getType(toggleDarkMode):
      const newDarkMode = !state.darkMode
      setDarkModeClass(newDarkMode)
      return { ...state, darkMode: newDarkMode }
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
          id: state.id
        },
        email: action.payload.email,
        id: action.payload.id
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
        teamID: action.payload.selected_team,
        updatingEmail: false
      }
    default:
      return state
  }
}

export default user
