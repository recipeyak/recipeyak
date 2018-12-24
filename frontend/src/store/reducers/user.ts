import * as t from "../actionTypes"

import { socialAccounts, ISocialAccountsState } from "./socialAccounts"

import { setDarkModeClass } from "../../sideEffects"

import raven from "raven-js"

/** User state from API */
export interface IUser {
  readonly avatar_url: string
  readonly email: string
  readonly id: number
  readonly has_usable_password?: boolean
  readonly dark_mode_enabled: boolean
  readonly selected_team: number | null
}

export type SocialProvider = "github" | "gitlab"
export interface ISocialConnection {
  readonly id: number | null
  readonly provider: SocialProvider
  readonly uid?: string
  readonly last_login?: string
  readonly date_joined?: string
}

export interface IUserState {
  readonly id: null | number
  readonly loggedIn: boolean
  readonly avatarURL: string
  readonly email: string
  readonly loading: boolean
  readonly error: boolean
  readonly stats: unknown
  readonly stats_loading: boolean
  readonly loggingOut: boolean
  readonly darkMode: boolean
  readonly hasUsablePassword: boolean
  readonly socialAccountConnections: ISocialAccountsState
  readonly scheduleURL: string
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
  stats: {},
  stats_loading: false,
  loggingOut: false,
  darkMode: false,
  hasUsablePassword: false,
  socialAccountConnections: {
    github: null,
    gitlab: null
  },
  scheduleURL: "/schedule/",
  teamID: null,
  updatingEmail: false
}

export const user = (state: IUserState = initialState, action: any) => {
  switch (action.type) {
    case t.SET_USER_STATS:
      return { ...state, stats: action.val }
    case t.SET_LOADING_USER_STATS:
      return { ...state, stats_loading: action.val }
    case t.SET_LOGGING_OUT:
      raven.setUserContext()
      return { ...state, loggingOut: action.val }
    case t.SET_SOCIAL_ACCOUNT_CONNECTIONS:
    case t.SET_SOCIAL_ACCOUNT_CONNECTION:
      return {
        ...state,
        socialAccountConnections: socialAccounts(
          state.socialAccountConnections,
          action
        )
      }
    case t.SET_USER_LOGGED_IN:
      return { ...state, loggedIn: action.val }
    case t.TOGGLE_DARK_MODE:
      const newDarkMode = !state.darkMode
      setDarkModeClass(newDarkMode)
      return { ...state, darkMode: newDarkMode }
    case t.SET_SCHEDULE_URL:
      return { ...state, scheduleURL: action.scheduleURL }
    case t.UPDATE_EMAIL_START:
      return { ...state, updatingEmail: false }
    case t.UPDATE_EMAIL_FAILURE:
      return { ...state, updatingEmail: false }
    case t.FETCH_USER_START:
      return { ...state, loading: true, error: false }
    case t.FETCH_USER_FAILURE:
      return { ...state, loading: false, error: true }
    // TODO(chdsbd): Replace login usage with FETCH_USER_SUCCESS
    case t.LOG_IN:
    case t.UPDATE_EMAIL_SUCCESS:
    case t.FETCH_USER_SUCCESS:
      // TODO(chdsbd): Fix when we have union of actions for type refinement.
      const val = action.payload as IUser
      raven.setUserContext({
        ...{
          email: state.email,
          id: state.id
        },
        email: val.email,
        id: val.id
      })
      return {
        ...state,
        loading: false,
        loggedIn: true,
        hasUsablePassword: val.has_usable_password,
        email: val.email,
        avatarURL: val.avatar_url,
        id: val.id,
        darkMode: val.dark_mode_enabled,
        teamID: val.selected_team,
        updatingEmail: false
      }
    default:
      return state
  }
}

export default user
