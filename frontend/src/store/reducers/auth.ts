import { action as act } from "typesafe-actions"

const SET_FROM_URL = "SET_FROM_URL"
const SET_ERROR_LOGIN = "SET_ERROR_LOGIN"
const SET_ERROR_SOCIAL_LOGIN = "SET_ERROR_SOCIAL_LOGIN"
const SET_ERROR_SIGNUP = "SET_ERROR_SIGNUP"
const SET_ERROR_RESET = "SET_ERROR_RESET"
const SET_ERROR_RESET_CONFIRMATION = "SET_ERROR_RESET_CONFIRMATION"
export const setFromUrl = (val: string) => act(SET_FROM_URL, val)
export const setErrorLogin = (val: ILoginError) => act(SET_ERROR_LOGIN, val)
export const setErrorSocialLogin = (val: ISocialError) =>
  act(SET_ERROR_SOCIAL_LOGIN, val)
export const setErrorSignup = (val: ISignupErrors) => act(SET_ERROR_SIGNUP, val)
export const setErrorReset = (val: IPasswordResetError) =>
  act(SET_ERROR_RESET, val)
export const setErrorResetConfirmation = (val: IPasswordResetConfirmError) =>
  act(SET_ERROR_RESET_CONFIRMATION, val)


export type AuthActions =
  | ReturnType<typeof setFromUrl>
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

export interface IAuthState {
  readonly fromUrl: string
  readonly errorLogin: ILoginError
  readonly errorSocialLogin: ISocialError
  readonly errorSignup: ISignupErrors
  readonly errorReset: IPasswordResetError
  readonly errorResetConfirmation: IPasswordResetConfirmError
}

export const initialState: IAuthState = {
  fromUrl: "",
  errorLogin: {},
  errorSocialLogin: {},
  errorSignup: {},
  errorReset: {},
  errorResetConfirmation: {}
}

const auth = (
  state: IAuthState = initialState,
  action: AuthActions
): IAuthState => {
  switch (action.type) {
    case SET_FROM_URL:
      return { ...state, fromUrl: action.payload }
    case SET_ERROR_LOGIN:
      return { ...state, errorLogin: action.payload }
    case SET_ERROR_SOCIAL_LOGIN:
      return { ...state, errorSocialLogin: action.payload }
    case SET_ERROR_SIGNUP:
      return { ...state, errorSignup: action.payload }
    case SET_ERROR_RESET:
      return { ...state, errorReset: action.payload }
    case SET_ERROR_RESET_CONFIRMATION:
      return { ...state, errorResetConfirmation: action.payload }
    default:
      return state
  }
}

export default auth
