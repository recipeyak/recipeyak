import {
  SET_LOADING_PASSWORD_UPDATE,
  SET_ERROR_PASSWORD_UPDATE
} from "../actionTypes"
import { AnyAction } from "redux"

export interface IPasswordChangeState {
  readonly loadingPasswordUpdate: boolean
  readonly errorPasswordUpdate: unknown
}

export const initialState: IPasswordChangeState = {
  loadingPasswordUpdate: false,
  errorPasswordUpdate: {}
}

export const passwordChange = (
  state: IPasswordChangeState = initialState,
  action: AnyAction
) => {
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
