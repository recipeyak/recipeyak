import {
  LOG_IN,
  LOG_OUT,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  ADD_RECIPE,
  REMOVE_RECIPE,
  ADD_STEP_TO_RECIPE,
  ADD_INGREDIENT_TO_RECIPE,
  UPDATE_RECIPE_NAME,
  DELETE_INGREDIENT,
} from './actionTypes.js'

export const login = () => {
  return {
    type: LOG_IN,
  }
}

export const logout = () => {
  return {
    type: LOG_OUT,
  }
}

export const addToCart = id => {
  return {
    type: ADD_TO_CART,
    id,
  }
}

export const removeFromCart = id => {
  return {
    type: REMOVE_FROM_CART,
    id,
  }
}

export const addRecipe = recipe => {
  return {
    type: ADD_RECIPE,
    recipe,
  }
}

export const addStepToRecipe = (id, step) => {
  return {
    type: ADD_STEP_TO_RECIPE,
    id,
    step,
  }
}

export const addIngredientToRecipe = (id, ingredient) => {
  return {
    type: ADD_INGREDIENT_TO_RECIPE,
    id,
    ingredient,
  }
}

export const updateRecipeName = (id, name) => {
  return {
    type: UPDATE_RECIPE_NAME,
    id,
    name,
  }
}

export const deleteIngredient = (id, index) => {
  return {
    type: DELETE_INGREDIENT,
    id,
    index,
  }
}

export const removeRecipe = id => {
  return {
    type: REMOVE_RECIPE,
    id,
  }
}
