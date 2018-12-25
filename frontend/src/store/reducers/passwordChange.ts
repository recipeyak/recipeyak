import { action } from "typesafe-actions";




const SET_LOADING_PASSWORD_UPDATE = "SET_LOADING_PASSWORD_UPDATE"
const SET_ERROR_PASSWORD_UPDATE = "SET_ERROR_PASSWORD_UPDATE"


export const setLoadingPasswordUpdate = (val: boolean) => action(
  SET_LOADING_PASSWORD_UPDATE, val )

export const setErrorPasswordUpdate = (val: IPasswordUpdateError) => action(SET_ERROR_PASSWORD_UPDATE, val)


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
    case SET_LOADING_PASSWORD_UPDATE:
      return { ...state, loadingPasswordUpdate: action.payload }
    case SET_ERROR_PASSWORD_UPDATE:
      return { ...state, errorPasswordUpdate: action.payload }
    default:
      return state
  }
}

export default passwordChange
