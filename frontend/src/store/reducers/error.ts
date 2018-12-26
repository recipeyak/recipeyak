// TODO(sbdchd): this reducer shouldn't even exist
import { action as act } from "typesafe-actions"

const SET_ERROR_LOGIN = "SET_ERROR_LOGIN"

const SET_ERROR_SOCIAL_LOGIN = "SET_ERROR_SOCIAL_LOGIN"

const SET_ERROR_SIGNUP = "SET_ERROR_SIGNUP"

const SET_ERROR_RECIPES = "SET_ERROR_RECIPES"
const SET_ERROR_RESET = "SET_ERROR_RESET"

const SET_ERROR_RESET_CONFIRMATION = "SET_ERROR_RESET_CONFIRMATION"

const SET_ERROR_ADD_RECIPE = "SET_ERROR_ADD_RECIPE"

export const setErrorLogin = (val: ILoginError) => act(SET_ERROR_LOGIN, val)

export const setErrorSocialLogin = (val: ISocialError) =>
  act(SET_ERROR_SOCIAL_LOGIN, val)

export const setErrorSignup = (val: ISignupErrors) => act(SET_ERROR_SIGNUP, val)

export const setErrorRecipes = (val: boolean) => act(SET_ERROR_RECIPES, val)

export const setErrorReset = (val: IPasswordResetError) =>
  act(SET_ERROR_RESET, val)

export const setErrorResetConfirmation = (val: IPasswordResetConfirmError) =>
  act(SET_ERROR_RESET_CONFIRMATION, val)

export const setErrorAddRecipe = (val: IAddRecipeError) =>
  act(SET_ERROR_ADD_RECIPE, val)

export type ErrorActions =
  | ReturnType<typeof setErrorLogin>
  | ReturnType<typeof setErrorSocialLogin>
  | ReturnType<typeof setErrorSignup>
  | ReturnType<typeof setErrorRecipes>
  | ReturnType<typeof setErrorReset>
  | ReturnType<typeof setErrorResetConfirmation>
  | ReturnType<typeof setErrorAddRecipe>

export interface IAddRecipeError {
  readonly errorWithName?: boolean
  readonly errorWithIngredients?: boolean
  readonly errorWithSteps?: boolean
}

export interface IPasswordResetConfirmError {
  readonly nonFieldErrors?: ReadonlyArray<string>
  readonly newPassword1?: ReadonlyArray<string>
  readonly newPassword2?: ReadonlyArray<string>
}

export interface ISignupErrors {
  readonly password1?: ReadonlyArray<string>
  readonly password2?: ReadonlyArray<string>
  readonly nonFieldErrors?: ReadonlyArray<string>
  readonly email?: ReadonlyArray<string>
}

export interface ILoginError {
  readonly password1?: ReadonlyArray<string>
  readonly nonFieldErrors?: ReadonlyArray<string>
  readonly email?: ReadonlyArray<string>
}

export interface IPasswordResetError {
  readonly nonFieldErrors?: ReadonlyArray<string>
  readonly email?: ReadonlyArray<string>
}

export interface ISocialError {
  readonly emailSocial?: ReadonlyArray<string>
  readonly nonFieldErrorsSocial?: ReadonlyArray<string>
}

export interface IErrorState {
  readonly login: ILoginError
  readonly socialLogin: ISocialError
  readonly signup: ISignupErrors
  readonly reset: IPasswordResetError
  readonly resetConfirmation: IPasswordResetConfirmError
  readonly addRecipe: IAddRecipeError
  readonly recipes: boolean
}

export const initialState: IErrorState = {
  login: {},
  socialLogin: {},
  signup: {},
  reset: {},
  resetConfirmation: {},
  addRecipe: {
    errorWithName: false,
    errorWithIngredients: false,
    errorWithSteps: false
  },
  recipes: false
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
    case SET_ERROR_RECIPES:
      return { ...state, recipes: action.payload }
    case SET_ERROR_RESET:
      return { ...state, reset: action.payload }
    case SET_ERROR_RESET_CONFIRMATION:
      return { ...state, resetConfirmation: action.payload }
    case SET_ERROR_ADD_RECIPE:
      return { ...state, addRecipe: action.payload }
    default:
      return state
  }
}

export default error
