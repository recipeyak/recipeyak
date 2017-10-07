import {
  LOG_IN,
  LOG_OUT,
} from '../actionTypes.js'

export const user = (
  state = {
    loggedIn: false,
    token: null,
  },
  action) => {
  switch (action.type) {
    case LOG_IN:
      return { ...state, loggedIn: true, token: action.token }
    case LOG_OUT:
      return { ...state, loggedIn: false, token: null }
    default:
      return state
  }
}

export default user
