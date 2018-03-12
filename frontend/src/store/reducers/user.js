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
  SET_SOCIAL_ACCOUNT_CONNECTION,
  SET_USER_ID,
} from '../actionTypes'

import { socialAccounts } from './socialAccounts'

import { setDarkModeClass } from '../../sideEffects'

import raven from 'raven-js'

const initialState = {
  id: null,
  loggedIn: false,
  token: null,
  avatarURL: '',
  loading: false,
  error: false,
  stats: {},
  stats_loading: false,
  loggingOut: false,
  darkMode: false,
  hasUsablePassword: false,
  socialAccountConnections: {
    github: null,
    gitlab: null,
  }
}

export const user = (
  state = initialState,
  action
) => {
  switch (action.type) {
  case LOG_IN:
    raven.setUserContext({
      ...{
        email: state.email,
        id: state.id,
      },
      email: action.user.email,
      id: action.user.id,
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
  case SET_SOCIAL_ACCOUNT_CONNECTION:
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
