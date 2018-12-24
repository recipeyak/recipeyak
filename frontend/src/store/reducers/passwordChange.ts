import t from "../actionTypes"
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
    case t.SET_LOADING_PASSWORD_UPDATE:
      return { ...state, loadingPasswordUpdate: action.val }
    case t.SET_ERROR_PASSWORD_UPDATE:
      return { ...state, errorPasswordUpdate: action.val }
    default:
      return state
  }
}

export default passwordChange
