import {
  SET_LOADING_PASSWORD_UPDATE,
  SET_ERROR_PASSWORD_UPDATE
} from '../actionTypes'

interface SetLoadingPasswordUpdate {
  type: typeof SET_LOADING_PASSWORD_UPDATE
  val: boolean
}

export interface ErrorPasswordUpdate {
  newPasswordAgain: boolean
  newPassword: boolean
  oldPassword: boolean
}

interface SetErrorPasswordUpdate {
  type: typeof SET_ERROR_PASSWORD_UPDATE
  val: ErrorPasswordUpdate
}

type PasswordChangeActions = SetLoadingPasswordUpdate
  | SetErrorPasswordUpdate

const initialState = {
  loadingPasswordUpdate: false,
  errorPasswordUpdate: {} as ErrorPasswordUpdate
}

export type PasswordChangeState = typeof initialState

export const passwordChange = (
  state = initialState,
  action: PasswordChangeActions) => {
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
