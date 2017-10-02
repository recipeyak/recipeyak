import {
  SET_ERROR_LOGIN,
  SET_ERROR_SIGNUP,
  SET_ERROR_RESET,
  SET_ERROR_ADD_RECIPE,
  SET_ERROR_RECIPES,
  SET_ERROR_CART,
} from '../actionTypes.js'

const error = (state = {
  login: {},
  signup: {},
  reset: {},
  addRecipe: false,
  recipes: false,
  cart: false,
}, action) => {
  switch (action.type) {
    case SET_ERROR_LOGIN:
      return { ...state, login: action.val }
    case SET_ERROR_SIGNUP:
      return { ...state, signup: action.val }
    case SET_ERROR_RECIPES:
      return { ...state, recipes: action.val }
    case SET_ERROR_RESET:
      return { ...state, reset: action.val }
    case SET_ERROR_ADD_RECIPE:
      return { ...state, addRecipe: action.val }
    case SET_ERROR_CART:
      return { ...state, cart: action.val }
    default:
      return state
  }
}

export default error
