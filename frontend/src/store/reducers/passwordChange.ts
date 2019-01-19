import { createStandardAction, getType } from "typesafe-actions"

export const setLoadingPasswordUpdate = createStandardAction(
  "SET_LOADING_PASSWORD_UPDATE"
)<IPasswordChangeState["loadingPasswordUpdate"]>()
export const setErrorPasswordUpdate = createStandardAction(
  "SET_ERROR_PASSWORD_UPDATE"
)<IPasswordUpdateError>()

export type PasswordChangeActions =
  | ReturnType<typeof setLoadingPasswordUpdate>
  | ReturnType<typeof setErrorPasswordUpdate>

interface IPasswordUpdateError {
  readonly newPasswordAgain?: string[]
  readonly newPassword?: string[]
  readonly oldPassword?: string[]
}

export interface IPasswordChangeState {
  readonly loadingPasswordUpdate: boolean
  readonly errorPasswordUpdate: IPasswordUpdateError
}

export const initialState: IPasswordChangeState = {
  loadingPasswordUpdate: false,
  errorPasswordUpdate: {}
}

export const passwordChange = (
  state: IPasswordChangeState = initialState,
  action: PasswordChangeActions
): IPasswordChangeState => {
  switch (action.type) {
    case getType(setLoadingPasswordUpdate):
      return { ...state, loadingPasswordUpdate: action.payload }
    case getType(setErrorPasswordUpdate):
      return { ...state, errorPasswordUpdate: action.payload }
    default:
      return state
  }
}

export default passwordChange
