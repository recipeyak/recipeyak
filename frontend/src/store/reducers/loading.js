import {
  SET_LOADING_LOGIN,
  SET_LOADING_SIGNUP,
  SET_LOADING_RESET,
} from '../actionTypes.js'

const defaultState = {
  login: false,
  signup: false,
  reset: false,
}

const loading = (state = defaultState, action) => {
  switch (action.type) {
    case SET_LOADING_LOGIN:
      return { ...state, login: action.val }
    case SET_LOADING_SIGNUP:
      return { ...state, signup: action.val }
    case SET_LOADING_RESET:
      return { ...state, reset: action.val }
    default:
      return state
  }
}

export default loading
