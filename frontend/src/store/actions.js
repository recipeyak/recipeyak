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
  DELETE_STEP,
  UPDATE_RECIPE_SOURCE,
  UPDATE_RECIPE_AUTHOR,
  UPDATE_RECIPE_TIME,
} from './actionTypes.js'

import axios from 'axios'

export const login = token => {
  return {
    type: LOG_IN,
    token,
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

export const updateRecipeSource = (id, source) => {
  return {
    type: UPDATE_RECIPE_SOURCE,
    id,
    source,
  }
}

export const updateRecipeAuthor = (id, author) => {
  return {
    type: UPDATE_RECIPE_AUTHOR,
    id,
    author,
  }
}

export const updateRecipeTime = (id, time) => {
  return {
    type: UPDATE_RECIPE_TIME,
    id,
    time,
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

export const deleteStep = (id, index) => {
  return {
    type: DELETE_STEP,
    id,
    index,
  }
}

function sendLoginInfo (email, password) {
  return axios.post('/api/v1/rest-auth/login/', { email, password })
}

export const logUserIn = (email, password) => {
  return function (dispatch) {
    sendLoginInfo(email, password)
      .then(res => {
        dispatch(login(res.data.key))
      })
      .catch(e => {
        console.warn('error logging in ', e)
      })
  }
}
