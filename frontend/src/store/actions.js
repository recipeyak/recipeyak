import {LOG_IN, LOG_OUT, ADD_TO_CART, REMOVE_FROM_CART, ADD_RECIPE, REMOVE_RECIPE} from './actionTypes.js'

export const login = () => {
  return {
    type: LOG_IN
  }
}

export const logout = () => {
  return {
    type: LOG_OUT
  }
}

export const addToCart = id => {
  return {
    type: ADD_TO_CART,
    id
  }
}

export const removeFromCart = id => {
  return {
    type: REMOVE_FROM_CART,
    id
  }
}

export const addRecipe = recipe => {
  return {
    type: ADD_RECIPE,
    recipe
  }
}

export const removeRecipe = id => {
  return {
    type: REMOVE_RECIPE,
    id
  }
}
