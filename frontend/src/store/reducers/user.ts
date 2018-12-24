import * as t from "../actionTypes"

import { socialAccounts, ISocialAccountsState } from "./socialAccounts"

import { setDarkModeClass } from "../../sideEffects"

import raven from "raven-js"

export interface IUser {
  readonly avatar_url: string
  readonly email: string
  readonly id: number
  readonly has_usable_password?: boolean
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

interface IUserState {
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
  scheduleURL: "/schedule/"
}

export const user = (state: IUserState = initialState, action: any) => {
  switch (action.type) {
    case t.LOG_IN:
      raven.setUserContext({
        ...{
          email: state.email,
          id: state.id
        },
        email: action.user.email,
        id: action.user.id
      })
      return {
        ...state,
        avatarURL: action.user.avatar_url,
        email: action.user.email,
        id: action.user.id,
        loggedIn: true,
        hasUsablePassword: action.user.has_usable_password
      }
    case t.SET_AVATAR_URL:
      return { ...state, avatarURL: action.url }
    case t.SET_USER_EMAIL:
      return { ...state, email: action.email }
    case t.SET_LOADING_USER:
      return { ...state, loading: action.val }
    case t.SET_ERROR_USER:
      return { ...state, error: action.val }
    case t.SET_USER_STATS:
      return { ...state, stats: action.val }
    case t.SET_LOADING_USER_STATS:
      return { ...state, stats_loading: action.val }
    case t.SET_UPDATING_USER_EMAIL:
      return { ...state, updatingEmail: action.val }
    case t.SET_LOGGING_OUT:
      raven.setUserContext()
      return { ...state, loggingOut: action.val }
    case t.SET_PASSWORD_USABLE:
      return { ...state, hasUsablePassword: action.val }
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
    case t.SET_USER_ID:
      return { ...state, id: action.id }
    case t.SET_SCHEDULE_URL:
      return { ...state, scheduleURL: action.scheduleURL }
    default:
      return state
  }
}

export default user
