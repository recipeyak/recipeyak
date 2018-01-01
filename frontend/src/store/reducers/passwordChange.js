import {
  SET_LOADING_PASSWORD_UPDATE,
  SET_ERROR_PASSWORD_UPDATE
} from '../actionTypes'

export const passwordChange = (
  state = {
    loadingPasswordUpdate: false,
    errorPasswordUpdate: {}
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

export default passwordChange
