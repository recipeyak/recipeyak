// TODO(sbdchd): this reducer shouldn't even exist
import { action as act } from "typesafe-actions"

const SET_ERROR_LOGIN = "SET_ERROR_LOGIN"

const SET_ERROR_SOCIAL_LOGIN = "SET_ERROR_SOCIAL_LOGIN"

const SET_ERROR_SIGNUP = "SET_ERROR_SIGNUP"

const SET_ERROR_RESET = "SET_ERROR_RESET"

const SET_ERROR_RESET_CONFIRMATION = "SET_ERROR_RESET_CONFIRMATION"

export const setErrorLogin = (val: ILoginError) => act(SET_ERROR_LOGIN, val)

export const setErrorSocialLogin = (val: ISocialError) =>
  act(SET_ERROR_SOCIAL_LOGIN, val)

export const setErrorSignup = (val: ISignupErrors) => act(SET_ERROR_SIGNUP, val)

export const setErrorReset = (val: IPasswordResetError) =>
  act(SET_ERROR_RESET, val)

export const setErrorResetConfirmation = (val: IPasswordResetConfirmError) =>
  act(SET_ERROR_RESET_CONFIRMATION, val)

export type ErrorActions =
  | ReturnType<typeof setErrorLogin>
  | ReturnType<typeof setErrorSocialLogin>
  | ReturnType<typeof setErrorSignup>
  | ReturnType<typeof setErrorReset>
  | ReturnType<typeof setErrorResetConfirmation>

export interface IPasswordResetConfirmError {
  readonly nonFieldErrors?: string[]
  readonly newPassword1?: string[]
  readonly newPassword2?: string[]
}

export interface ISignupErrors {
  readonly password1?: string[]
  readonly password2?: string[]
  readonly nonFieldErrors?: string[]
  readonly email?: string[]
}

export interface ILoginError {
  readonly password1?: string[]
  readonly nonFieldErrors?: string[]
  readonly email?: string[]
}

export interface IPasswordResetError {
  readonly nonFieldErrors?: string[]
  readonly email?: string[]
}

export interface ISocialError {
  readonly emailSocial?: string[]
  readonly nonFieldErrorsSocial?: string[]
}

export interface IErrorState {
  readonly login: ILoginError
  readonly socialLogin: ISocialError
  readonly signup: ISignupErrors
  readonly reset: IPasswordResetError
  readonly resetConfirmation: IPasswordResetConfirmError
}

export const initialState: IErrorState = {
  login: {},
  socialLogin: {},
  signup: {},
  reset: {},
  resetConfirmation: {}
}

const error = (
  state: IErrorState = initialState,
  action: ErrorActions
): IErrorState => {
  switch (action.type) {
    case SET_ERROR_LOGIN:
      return { ...state, login: action.payload }
    case SET_ERROR_SOCIAL_LOGIN:
      return { ...state, socialLogin: action.payload }
    case SET_ERROR_SIGNUP:
      return { ...state, signup: action.payload }
    case SET_ERROR_RESET:
      return { ...state, reset: action.payload }
    case SET_ERROR_RESET_CONFIRMATION:
      return { ...state, resetConfirmation: action.payload }
    default:
      return state
  }
}

export default error
