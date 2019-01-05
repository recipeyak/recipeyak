import { setDarkModeClass } from "@/sideEffects"

import raven from "raven-js"
import {
  createAsyncAction,
  createStandardAction,
  action as act,
  ActionType,
  getType
} from "typesafe-actions"
import { IRecipe } from "@/store/reducers/recipes"
import { WebData, Success, Failure, HttpErrorKind, Loading } from "@/webdata"

const LOG_IN = "LOG_IN"

const UPDATE_EMAIL_START = "UPDATE_EMAIL_START"
const UPDATE_EMAIL_SUCCESS = "UPDATE_EMAIL_SUCCESS"
const UPDATE_EMAIL_FAILURE = "UPDATE_EMAIL_FAILURE"

const SET_TEAM_ID = "SET_TEAM_ID"

const SET_SOCIAL_ACCOUNT_CONNECTIONS = "SET_SOCIAL_ACCOUNT_CONNECTIONS"
const SET_SOCIAL_ACCOUNT_CONNECTION = "SET_SOCIAL_ACCOUNT_CONNECTION"

const FETCH_USER_START = "FETCH_USER_START"
const FETCH_USER_SUCCESS = "FETCH_USER_SUCCESS"
const FETCH_USER_FAILURE = "FETCH_USER_FAILURE"

const TOGGLE_DARK_MODE = "TOGGLE_DARK_MODE"

const SET_LOGGING_OUT = "SET_LOGGING_OUT"

export const fetchUserStats = createAsyncAction(
  "FETCH_USER_STATS_START",
  "FETCH_USER_STATS_SUCCESS",
  "FETCH_USER_STATS_FAILURE"
)<void, IUserStats, void>()

export const SET_USER_LOGGED_IN = "SET_USER_LOGGED_IN"

// TODO(chdsbd): Replace usage with fetchUser#success. Update user reducer.
export const login = (payload: IUser) => act(LOG_IN, payload)

export const setLoggingOut = (val: boolean) => act(SET_LOGGING_OUT, val)

export const updateTeamID = createStandardAction(SET_TEAM_ID)<number | null>()

export const setSocialConnections = (val: ISocialConnection[]) =>
  act(SET_SOCIAL_ACCOUNT_CONNECTIONS, val)

export const setSocialConnection = (provider: SocialProvider, val: unknown) =>
  act(SET_SOCIAL_ACCOUNT_CONNECTION, {
    provider,
    val
  })

export const setUserLoggedIn = (val: boolean) => act(SET_USER_LOGGED_IN, val)

export const fetchingUser = createAsyncAction(
  FETCH_USER_START,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE
)<void, IUser, void>()

export const toggleDarkMode = () => act(TOGGLE_DARK_MODE)

export const updateEmail = createAsyncAction(
  UPDATE_EMAIL_START,
  UPDATE_EMAIL_SUCCESS,
  UPDATE_EMAIL_FAILURE
)<void, IUser, void>()

export type UserActions =
  | ReturnType<typeof login>
  | ReturnType<typeof setLoggingOut>
  | ReturnType<typeof updateTeamID>
  | ReturnType<typeof setSocialConnections>
  | ReturnType<typeof setSocialConnection>
  | ReturnType<typeof setUserLoggedIn>
  | ActionType<typeof fetchingUser>
  | ReturnType<typeof toggleDarkMode>
  | ActionType<typeof updateEmail>
  | ActionType<typeof fetchUserStats>

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
  updatingEmail: false
}

export const user = (
  state: IUserState = initialState,
  action: UserActions
): IUserState => {
  switch (action.type) {
    case getType(fetchUserStats.success):
      return { ...state, stats: Success(action.payload) }
    case getType(fetchUserStats.request):
      return { ...state, stats: Loading() }
    case getType(fetchUserStats.failure):
      return { ...state, stats: Failure(HttpErrorKind.other) }
    case SET_LOGGING_OUT:
      raven.setUserContext()
      return { ...state, loggingOut: action.payload }
    case SET_SOCIAL_ACCOUNT_CONNECTIONS:
      return {
        ...state,
        socialAccountConnections: {
          ...state.socialAccountConnections,
          ...action.payload.reduce(
            (acc, { provider, id }) => ({ ...acc, [provider]: id }),
            {}
          )
        }
      }
    case SET_SOCIAL_ACCOUNT_CONNECTION:
      return {
        ...state,
        socialAccountConnections: {
          ...state.socialAccountConnections,
          [action.payload.provider]: action.payload.val
        }
      }
    case SET_TEAM_ID:
      return { ...state, teamID: action.payload }
    case SET_USER_LOGGED_IN:
      return { ...state, loggedIn: action.payload }
    case TOGGLE_DARK_MODE:
      const newDarkMode = !state.darkMode
      setDarkModeClass(newDarkMode)
      return { ...state, darkMode: newDarkMode }
    case UPDATE_EMAIL_START:
      return { ...state, updatingEmail: false }
    case UPDATE_EMAIL_FAILURE:
      return { ...state, updatingEmail: false }
    case FETCH_USER_START:
      return { ...state, loading: true, error: false }
    case FETCH_USER_FAILURE:
      return { ...state, loading: false, error: true }
    // TODO(chdsbd): Replace login usage with FETCH_USER_SUCCESS
    case LOG_IN:
    case UPDATE_EMAIL_SUCCESS:
    case FETCH_USER_SUCCESS:
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
