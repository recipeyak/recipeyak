import {
  SET_ERROR_LOGIN,
  SET_ERROR_SOCIAL_LOGIN,
  SET_ERROR_SIGNUP,
  SET_ERROR_RESET,
  SET_ERROR_ADD_RECIPE,
  SET_ERROR_RECIPES,
} from '../actionTypes'

export interface ErrorLogin {
  email: string
  password1: string
  nonFieldErrors: string[]
}

export interface ErrorSocialLogin {
  emailSocial: string
  nonFieldErrorsSocial: string[]
}

export interface ErrorSignup {
  email: string
  password1: string
  password2: string
  nonFieldErrors: string[]
}

export interface ErrorReset {
  email: string
  nonFieldErrors: string[]
}

export interface ErrorAddRecipe {
  errorWithName: boolean
  errorWithIngredients: boolean
  errorWithSteps: boolean
}

interface SetErrorLogin {
  type: typeof SET_ERROR_LOGIN
  val: ErrorLogin
}

interface SetErrorSocialLogin {
  type: typeof SET_ERROR_SOCIAL_LOGIN
  val: ErrorSocialLogin
}

interface SetErrorSignup {
  type: typeof SET_ERROR_SIGNUP
  val: ErrorSignup
}

interface SetErrorRecipes {
  type: typeof SET_ERROR_RECIPES
  val: boolean
}

interface SetErrorReset {
  type: typeof SET_ERROR_RESET
  val: ErrorReset
}

interface SetErrorAddRecipe {
  type: typeof SET_ERROR_ADD_RECIPE
  val: ErrorAddRecipe
}

type ErrorAction = SetErrorLogin
  | SetErrorSocialLogin
  | SetErrorSignup
  | SetErrorRecipes
  | SetErrorReset
  | SetErrorAddRecipe

const initialState = {
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
  recipes: false,
  cart: false
}

export type ErrorState = typeof initialState

const error = (state = initialState, action: ErrorAction) => {
  switch (action.type) {
  case SET_ERROR_LOGIN:
    return { ...state, login: action.val }
  case SET_ERROR_SOCIAL_LOGIN:
    return { ...state, socialLogin: action.val }
  case SET_ERROR_SIGNUP:
    return { ...state, signup: action.val }
  case SET_ERROR_RECIPES:
    return { ...state, recipes: action.val }
  case SET_ERROR_RESET:
    return { ...state, reset: action.val }
  case SET_ERROR_ADD_RECIPE:
    return { ...state, addRecipe: action.val }
  default:
    return state
  }
}

export default error
