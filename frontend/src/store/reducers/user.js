import {
  LOG_IN,
  LOG_OUT,
  SET_AVATAR_URL,
  SET_USER_EMAIL
} from '../actionTypes.js'

export const user = (
  state = {
    loggedIn: false,
    token: null,
    avatarURL: ''
  },
  action) => {
  switch (action.type) {
    case LOG_IN:
      return { ...state, loggedIn: true, token: action.token }
    case LOG_OUT:
      return { ...state, loggedIn: false, token: null }
    case SET_AVATAR_URL:
      return { ...state, avatarURL: action.url }
    case SET_USER_EMAIL:
      return { ...state, email: action.email }
    default:
      return state
  }
}

export default user
