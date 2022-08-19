import {
  ActionType,
  createAsyncAction,
  createStandardAction,
  getType,
} from "typesafe-actions"

import { IUser } from "@/store/reducers/user"

export const setFromUrl =
  createStandardAction("SET_FROM_URL")<IAuthState["fromUrl"]>()

export const setErrorSignup =
  createStandardAction("SET_ERROR_SIGNUP")<ISignupErrors>()
export const setErrorReset =
  createStandardAction("SET_ERROR_RESET")<IPasswordResetError>()
export const setErrorResetConfirmation = createStandardAction(
  "SET_ERROR_RESET_CONFIRMATION",
)<IPasswordResetConfirmError>()

export const login = createAsyncAction(
  "LOGIN_REQUEST",
  "LOGIN_SUCCESS",
  "LOGIN_FAILURE",
)<void, IUser, ILoginError | void>()

export const cleareLoginErrors = createStandardAction("CLEAR_LOGIN_ERRORS")()

export const setLoadingSignup =
  createStandardAction("SET_LOADING_SIGNUP")<IAuthState["loadingSignup"]>()
export const setLoadingReset =
  createStandardAction("SET_LOADING_RESET")<IAuthState["loadingReset"]>()
export const setLoadingResetConfirmation = createStandardAction(
  "SET_LOADING_RESET_CONFIRMATION",
)<IAuthState["loadingResetConfirmation"]>()

export type AuthActions =
  | ReturnType<typeof setFromUrl>
  | ReturnType<typeof setErrorSignup>
  | ReturnType<typeof setErrorReset>
  | ReturnType<typeof setErrorResetConfirmation>
  | ActionType<typeof login>
  | ActionType<typeof cleareLoginErrors>
  | ReturnType<typeof setLoadingSignup>
  | ReturnType<typeof setLoadingReset>
  | ReturnType<typeof setLoadingResetConfirmation>

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

export interface IAuthState {
  readonly fromUrl: string
  readonly errorLogin: ILoginError
  readonly errorSignup: ISignupErrors
  readonly errorReset: IPasswordResetError
  readonly errorResetConfirmation: IPasswordResetConfirmError
  readonly loadingLogin: boolean
  readonly loadingSignup: boolean
  readonly loadingReset: boolean
  readonly loadingResetConfirmation: boolean
}

export const initialState: IAuthState = {
  fromUrl: "",
  errorLogin: {},
  errorSignup: {},
  errorReset: {},
  errorResetConfirmation: {},
  loadingLogin: false,
  loadingSignup: false,
  loadingReset: false,
  loadingResetConfirmation: false,
}

const auth = (
  state: IAuthState = initialState,
  action: AuthActions,
): IAuthState => {
  switch (action.type) {
    case getType(setFromUrl):
      return { ...state, fromUrl: action.payload }
    case getType(login.request):
      return { ...state, errorLogin: {}, loadingLogin: true }
    case getType(login.success):
      return { ...state, loadingLogin: false }
    case getType(login.failure):
      return { ...state, errorLogin: action.payload || {}, loadingLogin: false }
    case getType(cleareLoginErrors):
      return { ...state, errorLogin: {} }
    case getType(setErrorSignup):
      return { ...state, errorSignup: action.payload }
    case getType(setErrorReset):
      return { ...state, errorReset: action.payload }
    case getType(setErrorResetConfirmation):
      return { ...state, errorResetConfirmation: action.payload }
    case getType(setLoadingSignup):
      return { ...state, loadingSignup: action.payload }
    case getType(setLoadingReset):
      return { ...state, loadingReset: action.payload }
    case getType(setLoadingResetConfirmation):
      return { ...state, loadingResetConfirmation: action.payload }
    default:
      return state
  }
}

export default auth
