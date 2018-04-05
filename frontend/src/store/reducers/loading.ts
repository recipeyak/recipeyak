import {
  SET_LOADING_LOGIN,
  SET_LOADING_SIGNUP,
  SET_LOADING_RESET,
  SET_LOADING_RESET_CONFIRMATION,
  SET_LOADING_RECIPES,
  SET_LOADING_ADD_RECIPE,
  SET_LOADING_CART
} from '../actionTypes'

interface SetLoadingLogin {
  type: typeof SET_LOADING_LOGIN
  val: boolean
}

interface SetLoadingSignup {
  type: typeof SET_LOADING_SIGNUP
  val: boolean
}

interface SetLoadingReset {
  type: typeof SET_LOADING_RESET
  val: boolean
}

interface SetLoadingResetConfirmation {
  type: typeof SET_LOADING_RESET_CONFIRMATION
  val: boolean
}

interface SetLoadingCart {
  type: typeof SET_LOADING_CART
  val: boolean
}

interface SetLoadingRecipes {
  type: typeof SET_LOADING_RECIPES
  val: boolean
}

interface SetLoadingAddRecipe {
  type: typeof SET_LOADING_ADD_RECIPE
  val: boolean
}

type LoadingActions = SetLoadingLogin
  | SetLoadingSignup
  | SetLoadingReset
  | SetLoadingResetConfirmation
  | SetLoadingCart
  | SetLoadingRecipes
  | SetLoadingAddRecipe

const initialState = {
  login: false,
  signup: false,
  reset: false,
  resetConfirmation: false,
  recipes: false,
  addRecipe: false,
  cart: false
}

export type LoadingState = typeof initialState

const loading = (state = initialState, action: LoadingActions) => {
  switch (action.type) {
  case SET_LOADING_LOGIN:
    return { ...state, login: action.val }
  case SET_LOADING_SIGNUP:
    return { ...state, signup: action.val }
  case SET_LOADING_RESET:
    return { ...state, reset: action.val }
  case SET_LOADING_RESET_CONFIRMATION:
    return { ...state, resetConfirmation: action.val }
  case SET_LOADING_CART:
    return { ...state, cart: action.val }
  case SET_LOADING_RECIPES:
    return { ...state, recipes: action.val }
  case SET_LOADING_ADD_RECIPE:
    return { ...state, addRecipe: action.val }
  default:
    return state
  }
}

export default loading
