import {
  LOG_IN,
  SET_AVATAR_URL,
  SET_USER_EMAIL,
  SET_ERROR_USER,
  SET_LOADING_USER,
  SET_SOCIAL_ACCOUNT_CONNECTIONS,
  SET_USER_STATS,
  SET_LOADING_USER_STATS,
  SET_UPDATING_USER_EMAIL,
  SET_PASSWORD_USABLE,
  SET_LOGGING_OUT,
  TOGGLE_DARK_MODE,
  SET_USER_ID,
} from '../actionTypes'

import { socialAccounts, SetSocialAccountConnections, Provider } from './socialAccounts'

import { setDarkModeClass } from '../../sideEffects'

import raven from 'raven-js'

export interface User {
  email: string
  id: number
  avatar_url: string
  has_usable_password: boolean
}

interface LogIn {
  type: typeof LOG_IN
  user: User
  token: string
}

interface SetAvatarUrl {
  type: typeof SET_AVATAR_URL
  url: string
}

interface SetUserEmail {
  type: typeof SET_USER_EMAIL
  email: string
}

interface SetLoadingUser {
  type: typeof SET_LOADING_USER
  val: boolean
}

interface SetErrorUser {
  type: typeof SET_ERROR_USER
  val: boolean
}

export interface UserStats {
  date_joined: string
}

interface SetUserStats {
  type: typeof SET_USER_STATS
  val: UserStats
}

interface SetLoadingUserStats {
  type: typeof SET_LOADING_USER_STATS
  val: boolean
}

interface SetUpdatingUserEmail {
  type: typeof SET_UPDATING_USER_EMAIL
  val: boolean
}

interface SetLoggingOut {
  type: typeof SET_LOGGING_OUT
  val: boolean
}

interface SetPasswordUsable {
  type: typeof SET_PASSWORD_USABLE
  val: boolean
}

interface ToggleDarkMode {
  type: typeof TOGGLE_DARK_MODE
}

interface SetUserId {
  type: typeof SET_USER_ID
  id: number
}

type UserActions = LogIn
  | SetAvatarUrl
  | SetUserEmail
  | SetLoadingUser
  | SetErrorUser
  | SetUserStats
  | SetLoadingUserStats
  | SetUpdatingUserEmail
  | SetLoggingOut
  | SetPasswordUsable
  | SetSocialAccountConnections
  | ToggleDarkMode
  | SetUserId

const initialState = {
  id: null as number,
  loggedIn: false,
  token: null as string,
  email: '',
  avatarURL: '',
  loading: false,
  error: false,
  stats: {},
  stats_loading: false,
  loggingOut: false,
  darkMode: false,
  hasUsablePassword: false,
  updatingEmail: false,
  socialAccountConnections: {
    github: null as Provider,
    gitlab: null as Provider,
  }

}

export type UserState = typeof initialState

export const user = (
  state = initialState,
  action: UserActions
) => {
  switch (action.type) {
  case LOG_IN:
    raven.setUserContext({
      ...{
        email: state.email,
        id: String(state.id),
      },
      email: action.user.email,
      id: String(action.user.id),
    })
    return {
      ...state,
      avatarURL: action.user.avatar_url,
      email: action.user.email,
      id: action.user.id,
      loggedIn: true,
      hasUsablePassword: action.user.has_usable_password,
      token: action.token
    }
  case SET_AVATAR_URL:
    return { ...state, avatarURL: action.url }
  case SET_USER_EMAIL:
    return { ...state, email: action.email }
  case SET_LOADING_USER:
    return { ...state, loading: action.val }
  case SET_ERROR_USER:
    return { ...state, error: action.val }
  case SET_USER_STATS:
    return { ...state, stats: action.val }
  case SET_LOADING_USER_STATS:
    return { ...state, stats_loading: action.val }
  case SET_UPDATING_USER_EMAIL:
    return { ...state, updatingEmail: action.val }
  case SET_LOGGING_OUT:
    raven.setUserContext()
    return { ...state, loggingOut: action.val }
  case SET_PASSWORD_USABLE:
    return { ...state, hasUsablePassword: action.val }
  case SET_SOCIAL_ACCOUNT_CONNECTIONS:
    return {
      ...state,
      socialAccountConnections: socialAccounts(state.socialAccountConnections, action)
    }
  case TOGGLE_DARK_MODE:
    const newDarkMode = !state.darkMode
    setDarkModeClass(newDarkMode)
    return { ...state, darkMode: newDarkMode }
  case SET_USER_ID:
    return { ...state, id: action.id }
  default:
    return state
  }
}

export default user
