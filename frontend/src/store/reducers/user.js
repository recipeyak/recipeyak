import {
  LOG_IN,
  LOG_OUT,
  SET_AVATAR_URL,
  SET_USER_EMAIL,
  SET_ERROR_USER,
  SET_LOADING_USER,
  SET_USER_STATS,
  SET_LOADING_USER_STATS,
  SET_UPDATING_USER_EMAIL
} from '../actionTypes.js'

const initialState = {
  loggedIn: false,
  token: null,
  avatarURL: '',
  loading: false,
  error: false,
  stats: {},
  stats_loading: false
}

export const user = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case LOG_IN:
      return { ...state, loggedIn: true, token: action.token }
    case LOG_OUT:
      return initialState
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
    default:
      return state
  }
}

export default user
