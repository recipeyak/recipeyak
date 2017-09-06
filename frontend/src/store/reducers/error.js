import {
  SET_ERROR_LOGIN,
} from '../actionTypes.js'

const defaultState = {
  login: false,
}

const error = (state = defaultState, action) => {
  switch (action.type) {
    case SET_ERROR_LOGIN:
      return { ...state, login: action.val }
    default:
      return state
  }
}

export default error
