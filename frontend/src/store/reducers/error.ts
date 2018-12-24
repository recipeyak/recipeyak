import t from "../actionTypes"
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
    case t.SET_ERROR_LOGIN:
      return { ...state, login: action.val }
    case t.SET_ERROR_SOCIAL_LOGIN:
      return { ...state, socialLogin: action.val }
    case t.SET_ERROR_SIGNUP:
      return { ...state, signup: action.val }
    case t.SET_ERROR_RECIPES:
      return { ...state, recipes: action.val }
    case t.SET_ERROR_RESET:
      return { ...state, reset: action.val }
    case t.SET_ERROR_RESET_CONFIRMATION:
      return { ...state, resetConfirmation: action.val }
    case t.SET_ERROR_ADD_RECIPE:
      return { ...state, addRecipe: action.val }
    default:
      return state
  }
}

export default error
