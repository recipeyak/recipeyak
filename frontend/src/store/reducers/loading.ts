import { action } from "typesafe-actions"

export const SET_LOADING_LOGIN = "SET_LOADING_LOGIN"
export const SET_LOADING_SIGNUP = "SET_LOADING_SIGNUP"
export const SET_LOADING_RESET = "SET_LOADING_RESET"
export const SET_LOADING_RESET_CONFIRMATION = "SET_LOADING_RESET_CONFIRMATION"
export const SET_LOADING_RECIPES = "SET_LOADING_RECIPES"
export const SET_LOADING_ADD_RECIPE = "SET_LOADING_ADD_RECIPE"

export const setLoadingLogin = (val: boolean) => action(SET_LOADING_LOGIN, val)
export const setLoadingSignup = (val: boolean) =>
  action(SET_LOADING_SIGNUP, val)
export const setLoadingReset = (val: boolean) => action(SET_LOADING_RESET, val)
export const setLoadingResetConfirmation = (val: boolean) =>
  action(SET_LOADING_RESET_CONFIRMATION, val)
export const setLoadingRecipes = (val: boolean) =>
  action(SET_LOADING_RECIPES, val)
export const setLoadingAddRecipe = (val: boolean) =>
  action(SET_LOADING_ADD_RECIPE, val)

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

type LoadingActions =
  | ReturnType<typeof setLoadingLogin>
  | ReturnType<typeof setLoadingSignup>
  | ReturnType<typeof setLoadingReset>
  | ReturnType<typeof setLoadingResetConfirmation>
  | ReturnType<typeof setLoadingRecipes>
  | ReturnType<typeof setLoadingAddRecipe>

const loading = (
  state: ILoadingState = initialState,
  action: LoadingActions
) => {
  switch (action.type) {
    case SET_LOADING_LOGIN:
      return { ...state, login: action.payload }
    case SET_LOADING_SIGNUP:
      return { ...state, signup: action.payload }
    case SET_LOADING_RESET:
      return { ...state, reset: action.payload }
    case SET_LOADING_RESET_CONFIRMATION:
      return { ...state, resetConfirmation: action.payload }
    case SET_LOADING_RECIPES:
      return { ...state, recipes: action.payload }
    case SET_LOADING_ADD_RECIPE:
      return { ...state, addRecipe: action.payload }
    default:
      return state
  }
}

export default loading
