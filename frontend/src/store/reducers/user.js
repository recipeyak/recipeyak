import {
  LOG_IN,
  LOG_OUT,
  SET_AVATAR_URL,
} from '../actionTypes.js'

export const user = (
  state = {
    loggedIn: false,
    token: null,
    avatarURL: '',
  },
  action) => {
  switch (action.type) {
    case LOG_IN:
      return { ...state, loggedIn: true, token: action.token }
    case LOG_OUT:
      return { ...state, loggedIn: false, token: null }
    case SET_AVATAR_URL:
      return { ...state, avatarURL: action.url }
    default:
      return state
  }
}

export default user
