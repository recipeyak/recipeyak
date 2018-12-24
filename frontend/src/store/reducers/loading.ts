import t from "../actionTypes"
import { AnyAction } from "redux"

export interface ILoadingState {
  readonly login: boolean
  readonly signup: boolean
  readonly reset: boolean
  readonly resetConfirmation: boolean
  readonly recipes: boolean
  readonly addRecipe: boolean
}

export const initialState: ILoadingState = {
  login: false,
  signup: false,
  reset: false,
  resetConfirmation: false,
  recipes: false,
  addRecipe: false
}

const loading = (state: ILoadingState = initialState, action: AnyAction) => {
  switch (action.type) {
    case t.SET_LOADING_LOGIN:
      return { ...state, login: action.val }
    case t.SET_LOADING_SIGNUP:
      return { ...state, signup: action.val }
    case t.SET_LOADING_RESET:
      return { ...state, reset: action.val }
    case t.SET_LOADING_RESET_CONFIRMATION:
      return { ...state, resetConfirmation: action.val }
    case t.SET_LOADING_RECIPES:
      return { ...state, recipes: action.val }
    case t.SET_LOADING_ADD_RECIPE:
      return { ...state, addRecipe: action.val }
    default:
      return state
  }
}

export default loading
