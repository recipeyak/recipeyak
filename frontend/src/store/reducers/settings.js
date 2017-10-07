import {
  SET_LOADING_PASSWORD_UPDATE,
  SET_ERROR_PASSWORD_UPDATE
} from '../actionTypes.js'

export const settings = (
  state = {
    loadingPasswordUpdate: false,
    errorPasswordUpdate: false
  },
  action) => {
  switch (action.type) {
    case SET_LOADING_PASSWORD_UPDATE:
      return { ...state, loadingPasswordUpdate: action.val }
    case SET_ERROR_PASSWORD_UPDATE:
      return { ...state, errorPasswordUpdate: action.val }
    default:
      return state
  }
}

export default settings
