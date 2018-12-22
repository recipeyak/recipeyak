import {
  SET_ERROR_LOGIN,
  SET_ERROR_SOCIAL_LOGIN,
  SET_ERROR_SIGNUP,
  SET_ERROR_RESET,
  SET_ERROR_RESET_CONFIRMATION,
  SET_ERROR_ADD_RECIPE,
  SET_ERROR_RECIPES
} from "../actionTypes"
import { AnyAction } from "redux"

export interface IErrorState {
  readonly login: unknown
  readonly socialLogin: unknown
  readonly signup: unknown
  readonly reset: unknown
  readonly resetConfirmation: unknown
  readonly addRecipe:
    | {
        readonly errorWithName: boolean
        readonly errorWithIngredients: boolean
        readonly errorWithSteps: boolean
      }
    | boolean
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

const error = (state: IErrorState = initialState, action: AnyAction) => {
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
    case SET_ERROR_RESET_CONFIRMATION:
      return { ...state, resetConfirmation: action.val }
    case SET_ERROR_ADD_RECIPE:
      return { ...state, addRecipe: action.val }
    default:
      return state
  }
}

export default error
