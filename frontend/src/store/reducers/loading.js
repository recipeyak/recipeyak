import {
  LOADING_LOGIN,
} from '../actionTypes.js'

const defaultState = {
  login: false,
}

const loading = (state = defaultState, action) => {
  switch (action.type) {
    case LOADING_LOGIN:
      return { ...state, login: action.val }
    default:
      return state
  }
}

export default loading
