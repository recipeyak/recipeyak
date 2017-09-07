import {
  SET_ERROR_LOGIN,
  SET_ERROR_SIGNUP,
} from '../actionTypes.js'

const defaultState = {
  login: false,
}

const error = (state = defaultState, action) => {
  switch (action.type) {
    case SET_ERROR_LOGIN:
      return { ...state, login: action.val }
    case SET_ERROR_SIGNUP:
      return { ...state, signup: action.val }
    default:
      return state
  }
}

export default error
