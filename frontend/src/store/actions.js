import {
  LOG_IN,
  LOG_OUT,
  ADD_RECIPE,
  REMOVE_RECIPE,
  ADD_STEP_TO_RECIPE,
  SET_LOADING_ADD_STEP_TO_RECIPE,
  ADD_INGREDIENT_TO_RECIPE,
  UPDATE_RECIPE_NAME,
  DELETE_INGREDIENT,
  DELETE_STEP,
  UPDATE_RECIPE_SOURCE,
  UPDATE_RECIPE_AUTHOR,
  UPDATE_RECIPE_TIME,
  SET_LOADING_LOGIN,
  SET_ERROR_LOGIN,
  SET_LOADING_SIGNUP,
  SET_ERROR_SIGNUP,
  SET_LOADING_RESET,
  SET_LOADING_RECIPES,
  SET_ERROR_RESET,
  SET_NOTIFICATION,
  CLEAR_NOTIFICATION,
  UPDATE_INGREDIENT,
  SET_RECIPES,
  SET_LOADING_ADD_RECIPE,
  SET_ERROR_ADD_RECIPE,
  SET_ERROR_RECIPES,
  UPDATE_STEP,
  SET_CART,
  SET_CART_ITEM,
  SET_ERROR_CART,
  SET_LOADING_CART,
  SET_RECIPE_ADDING_TO_CART,
  SET_RECIPE_REMOVING_FROM_CART,
  SET_AVATAR_URL,
  SET_ERROR_PASSWORD_UPDATE,
  SET_LOADING_PASSWORD_UPDATE,
  SET_USER_EMAIL,
  SET_ERROR_USER,
  SET_LOADING_USER,
  SET_SHOPPING_LIST,
  SET_LOADING_SHOPPING_LIST
} from './actionTypes.js'

import { push } from 'react-router-redux'

import axios from 'axios'

export const login = token => {
  return {
    type: LOG_IN,
    token
  }
}

export const logout = () => {
  return {
    type: LOG_OUT
  }
}

const postLogout = token =>
  // empty body since post expects the second argument to be the body
  axios.post('/api/v1/rest-auth/logout/', {}, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const loggingOut = () => (dispatch, getState) => {
  postLogout(getState().user.token)
    .then(res => {
      dispatch(logout())
      dispatch(push('/login'))
    })
    .catch(err => {
      console.log('error adding recipe to cart', err)
    })
}

export const setLoadingUser = val => {
  return {
    type: SET_LOADING_USER,
    val
  }
}

export const setErrorUser = val => {
  return {
    type: SET_ERROR_USER,
    val
  }
}

export const setAvatarURL = url => {
  return {
    type: SET_AVATAR_URL,
    url
  }
}

export const setUserEmail = email => {
  return {
    type: SET_USER_EMAIL,
    email
  }
}

const patchEmail = (token, email) =>
  axios.patch('/api/v1/rest-auth/user/', { email }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const updatingEmail = email => (dispatch, getState) => {
  patchEmail(getState().user.token, email)
    .then(res => {
      dispatch(setUserEmail(res.data.email))
      dispatch(setAvatarURL(res.data.avatar_url))
    })
    .catch(err => {
      console.log('error updating email', err)
    })
}

const getUser = token =>
  // empty body since post expects the second argument to be the body
  axios.get('/api/v1/rest-auth/user/', {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

const invalidToken = res =>
  res.data.detail === 'Invalid token.' && res.status === 401

export const fetchUser = () => (dispatch, getState) => {
  dispatch(setLoadingUser(true))
  dispatch(setErrorUser(false))
  getUser(getState().user.token)
    .then(res => {
      dispatch(setAvatarURL(res.data.avatar_url))
      dispatch(setUserEmail(res.data.email))
      dispatch(setLoadingUser(false))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      dispatch(setLoadingUser(false))
      dispatch(setErrorUser(true))
    })
}

export const setLoadingPasswordUpdate = val => {
  return {
    type: SET_LOADING_PASSWORD_UPDATE,
    val
  }
}

export const setErrorPasswordUpdate = val => {
  return {
    type: SET_ERROR_PASSWORD_UPDATE,
    val
  }
}

const postPasswordChange = (token, password1, password2, oldPassword) =>
  axios.post('/api/v1/rest-auth/password/change/', {
    new_password1: password1,
    new_password2: password2,
    old_password: oldPassword
  }, {
    headers: {
      Authorization: `Token ${token}`
    }
  })

export const updatingPassword = (password1, password2, oldPassword) => (dispatch, getState) => {
  dispatch(setLoadingPasswordUpdate(true))
  dispatch(setErrorPasswordUpdate(false))
  postPasswordChange(getState().user.token, password1, password2, oldPassword)
    .then(res => {
      dispatch(setLoadingPasswordUpdate(false))
      // redirect to some random place afterwards
      // TODO: have a pop up notification saying there is a successful password change
      dispatch(push('/recipes'))
    })
    .catch(err => {
      dispatch(setLoadingPasswordUpdate(false))
      dispatch(setErrorPasswordUpdate(true))
      console.log('error updating password', err)
    })
}

export const setLoadingCart = val => {
  return {
    type: SET_LOADING_CART,
    val
  }
}

export const setErrorCart = val => {
  return {
    type: SET_ERROR_CART,
    val
  }
}

export const setCart = recipes => {
  return {
    type: SET_CART,
    recipes
  }
}

const getCart = (token, id) =>
  axios.get(`/api/v1/cart/`, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const fetchCart = id => (dispatch, getState) => {
  dispatch(setLoadingCart(true))
  dispatch(setErrorCart(false))
  getCart(getState().user.token, id)
    .then(res => {
      dispatch(setCart(res.data))
      dispatch(setLoadingCart(false))
    })
    .catch(err => {
      dispatch(setErrorCart(true))
      dispatch(setLoadingCart(false))
      console.log('error fetching cart', err)
    })
}

export const setCartItem = (id, count) => {
  return {
    type: SET_CART_ITEM,
    id,
    count
  }
}

const patchCart = (token, id, count) =>
  axios.patch(`/api/v1/cart/${id}/`, { count }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const addingToCart = id => (dispatch, getState) => {
  // we increment the cart value by 1, since we know the default / min cart
  // value is ensured to be 0 via the backend
  const count = getState().cart[id] + 1
  dispatch(setRecipeAddingToCart(id, true))
  return patchCart(getState().user.token, id, count)
    .then(res => {
      const { recipe, count } = res.data
      dispatch(setCartItem(recipe, count))
      dispatch(setRecipeAddingToCart(id, false))
      console.log('done: adding to cart')
    })
    .catch(err => {
      console.log('error adding recipe to cart', err)
      dispatch(setRecipeAddingToCart(id, false))
    })
}

export const setRecipeRemovingFromCart = (id, loading) => {
  return {
    type: SET_RECIPE_REMOVING_FROM_CART,
    id,
    loading
  }
}

export const removingFromCart = id => (dispatch, getState) => {
  const currentCount = getState().cart[id]
  const count = currentCount > 0 ? currentCount - 1 : 0
  dispatch(setRecipeRemovingFromCart(id, true))
  return patchCart(getState().user.token, id, count)
    .then(res => {
      const { recipe, count } = res.data
      dispatch(setCartItem(recipe, count))
      dispatch(setRecipeRemovingFromCart(id, false))
    })
    .catch(err => {
      console.log('error removing recipe from cart', err)
      dispatch(setRecipeRemovingFromCart(id, false))
    })
}

export const setLoadingShoppingList = val => {
  return {
    type: SET_LOADING_SHOPPING_LIST,
    val
  }
}

export const setShoppingList = val => {
  return {
    type: SET_SHOPPING_LIST,
    val
  }
}

const getShoppingList = token =>
  axios.get('/api/v1/shoppinglist/', {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const fetchShoppingList = () => (dispatch, getState) => {
  dispatch(setLoadingShoppingList(true))
  return getShoppingList(getState().user.token)
    .then(res => {
      dispatch(setShoppingList(res.data))
      dispatch(setLoadingShoppingList(false))
    })
    .catch(err => {
      console.error("couldn't fetch shopping list: ", err)
      dispatch(showNotificationWithTimeout({
        message: 'problem fetching shopping list',
        level: 'danger',
        sticky: true
      }))
      dispatch(setLoadingShoppingList(false))
    })
}

const sendPostNewRecipe = (token, recipe) =>
  axios.post('/api/v1/recipes/', recipe, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const addRecipe = recipe => {
  return {
    type: ADD_RECIPE,
    recipe
  }
}

export const setLoadingAddRecipe = val => {
  return {
    type: SET_LOADING_ADD_RECIPE,
    val
  }
}

export const setErrorAddRecipe = val => {
  return {
    type: SET_ERROR_ADD_RECIPE,
    val
  }
}

export const postNewRecipe = recipe => (dispatch, getState) => {
  dispatch(setLoadingAddRecipe(true))
  dispatch(setErrorAddRecipe(false))
  sendPostNewRecipe(getState().user.token, recipe)
    .then(res => {
      dispatch(addRecipe(res.data))
      dispatch(setLoadingAddRecipe(false))
      dispatch(push('/recipes'))
    })
    .catch(err => {
      console.warn(err)
      dispatch(setLoadingAddRecipe(false))
      dispatch(setErrorAddRecipe(true))

      dispatch(showNotificationWithTimeout({
        message: 'problem creating new recipe',
        level: 'danger',
        sticky: true
      }))
    })
}

const getRecipe = (token, id) =>
  axios.get(`/api/v1/recipes/${id}/`, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const fetchRecipe = id => (dispatch, getState) => {
  getRecipe(getState().user.token, id)
    .then(res => {
      dispatch(addRecipe(res.data))
    })
    .catch(err => {
      console.log('error fetching recipe', err)
    })
}

const getRecipeList = token =>
  axios.get('/api/v1/recipes/', {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const setRecipes = recipes => {
  return {
    type: SET_RECIPES,
    recipes
  }
}

export const setErrorRecipes = val => {
  return {
    type: SET_ERROR_RECIPES,
    val
  }
}

export const setLoadingRecipes = val => {
  return {
    type: SET_LOADING_RECIPES,
    val
  }
}

export const fetchRecipeList = () => (dispatch, getState) => {
  dispatch(setLoadingRecipes(true))
  dispatch(setErrorRecipes(false))
  getRecipeList(getState().user.token)
    .then(res => {
      dispatch(setRecipes(res.data))
      dispatch(setLoadingRecipes(false))
    })
    .catch(err => {
      console.warn('error fetching recipe list', err)
      dispatch(setErrorRecipes(true))
      dispatch(setLoadingRecipes(false))
    })
}

export const setLoadingAddStepToRecipe = (id, val) => {
  return {
    type: SET_LOADING_ADD_STEP_TO_RECIPE,
    id,
    val
  }
}

export const addStepToRecipe = (id, step) => {
  return {
    type: ADD_STEP_TO_RECIPE,
    id,
    step
  }
}

export const addIngredientToRecipe = (id, ingredient) => {
  return {
    type: ADD_INGREDIENT_TO_RECIPE,
    id,
    ingredient
  }
}

const postRecipeIngredient = (token, recipeID, ingredient) =>
  axios.post(`/api/v1/recipes/${recipeID}/ingredients/`, ingredient, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

// TODO: actually pass the correct stuff
export const addingRecipeIngredient = (recipeID, ingredient) => (dispatch, getState) =>
  postRecipeIngredient(getState().user.token, recipeID, ingredient)
    .then(res => {
      dispatch(addIngredientToRecipe(recipeID, res.data))
    })
    .catch(err => {
      console.log('error adding recipe ingredient', err)
    })

export const setRecipeAddingToCart = (id, loading) => {
  return {
    type: SET_RECIPE_ADDING_TO_CART,
    id,
    loading
  }
}

export const updateRecipeName = (id, name) => {
  return {
    type: UPDATE_RECIPE_NAME,
    id,
    name
  }
}

const patchRecipeName = (token, id, name) =>
  axios.patch(`/api/v1/recipes/${id}/`, { name }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const sendUpdatedRecipeName = (id, name) => (dispatch, getState) => {
  patchRecipeName(getState().user.token, id, name)
    .then(res => {
      dispatch(updateRecipeName(res.data.id, res.data.name))
    })
    .catch(err => {
      console.log('error updating recipe name', err)
    })
}

export const updateRecipeSource = (id, source) => {
  return {
    type: UPDATE_RECIPE_SOURCE,
    id,
    source
  }
}

const patchRecipeSource = (token, id, source) =>
  axios.patch(`/api/v1/recipes/${id}/`, { source }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const setRecipeSource = (id, source) => (dispatch, getState) => {
  patchRecipeSource(getState().user.token, id, source)
    .then(res => {
      dispatch(updateRecipeSource(res.data.id, res.data.source))
    })
    .catch(err => {
      console.log('error updating recipe source', err)
    })
}

export const updateRecipeAuthor = (id, author) => {
  return {
    type: UPDATE_RECIPE_AUTHOR,
    id,
    author
  }
}

const patchRecipeAuthor = (token, id, author) =>
  axios.patch(`/api/v1/recipes/${id}/`, { author }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const setRecipeAuthor = (id, author) => (dispatch, getState) => {
  patchRecipeAuthor(getState().user.token, id, author)
    .then(res => {
      dispatch(updateRecipeAuthor(res.data.id, res.data.author))
    })
    .catch(err => {
      console.log('error updating recipe author', err)
    })
}

export const updateRecipeTime = (id, time) => {
  return {
    type: UPDATE_RECIPE_TIME,
    id,
    time
  }
}

const patchRecipeTime = (token, id, time) =>
  axios.patch(`/api/v1/recipes/${id}/`, { time }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const setRecipeTime = (id, time) => (dispatch, getState) => {
  patchRecipeTime(getState().user.token, id, time)
    .then(res => {
      dispatch(updateRecipeTime(res.data.id, res.data.time))
    })
    .catch(err => {
      console.log('error updating recipe time', err)
    })
}

export const updateIngredient = (recipeID, ingredientID, content) => {
  return {
    type: UPDATE_INGREDIENT,
    recipeID,
    ingredientID,
    content
  }
}

const sendUpdateIngredient = (token, recipeID, ingredientID, content) =>
  axios.patch(`/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`, content, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

const postRecipeStep = (token, recipeID, step) =>
  axios.post(`/api/v1/recipes/${recipeID}/steps/`, { text: step }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const addingRecipeStep = (recipeID, step) => (dispatch, getState) => {
  dispatch(setLoadingAddStepToRecipe(recipeID, true))
  return postRecipeStep(getState().user.token, recipeID, step)
    .then(res => {
      dispatch(addStepToRecipe(recipeID, res.data))
      dispatch(setLoadingAddStepToRecipe(recipeID, false))
    })
    .catch(err => {
      console.log('error adding recipe step', err)
      dispatch(setLoadingAddStepToRecipe(recipeID, false))
    })
}

export const updatingIngredient = (recipeID, ingredientID, content) => (dispatch, getState) => {
  sendUpdateIngredient(getState().user.token, recipeID, ingredientID, content)
    .then(res => {
      dispatch(updateIngredient(recipeID, ingredientID, res.data))
    })
    .catch(err => {
      console.log('error updating recipe ingredient', err)
    })
}

export const deleteIngredient = (recipeID, ingredientID) => {
  return {
    type: DELETE_INGREDIENT,
    recipeID,
    ingredientID
  }
}

const sendDeleteIngredient = (token, recipeID, ingredientID) =>
  axios.delete(`/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const deletingIngredient = (recipeID, ingredientID) => (dispatch, getState) => {
  sendDeleteIngredient(getState().user.token, recipeID, ingredientID)
    .then(() => {
      dispatch(deleteIngredient(recipeID, ingredientID))
    })
    .catch(err => {
      console.log('error deleting recipe ingredient', err)
    })
}

export const removeRecipe = id => {
  return {
    type: REMOVE_RECIPE,
    id
  }
}

export const updateStep = (recipeID, stepID, text) => {
  return {
    type: UPDATE_STEP,
    recipeID,
    stepID,
    text
  }
}

const sendUpdateStep = (token, recipeID, stepID, text) =>
  axios.patch(`/api/v1/recipes/${recipeID}/steps/${stepID}/`, { text }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const updatingStep = (recipeID, stepID, text) => (dispatch, getState) => {
  sendUpdateStep(getState().user.token, recipeID, stepID, text)
    .then(res => {
      const text = res.data.text
      dispatch(updateStep(recipeID, stepID, text))
    })
    .catch(err => {
      console.log('error updating recipe step', err)
    })
}

export const deleteStep = (recipeID, stepID) => {
  return {
    type: DELETE_STEP,
    recipeID,
    stepID
  }
}

const sendDeleteStep = (token, recipeID, stepID) =>
  axios.delete(`/api/v1/recipes/${recipeID}/steps/${stepID}/`, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const deletingStep = (recipeID, stepID) => (dispatch, getState) => {
  sendDeleteStep(getState().user.token, recipeID, stepID)
    .then(() => {
      dispatch(deleteStep(recipeID, stepID))
    })
    .catch(err => {
      console.log('error deleting recipe step', err)
    })
}

export const setErrorLogin = val => {
  return {
    type: SET_ERROR_LOGIN,
    val
  }
}

export const setLoadingLogin = val => {
  return {
    type: SET_LOADING_LOGIN,
    val
  }
}

function sendLoginInfo (email, password) {
  return axios.post('/api/v1/rest-auth/login/', { email, password })
}

export const logUserIn = (email, password) => {
  return function (dispatch) {
    dispatch(setLoadingLogin(true))
    dispatch(setErrorLogin({}))
    dispatch(clearNotification())
    sendLoginInfo(email, password)
      .then(res => {
        dispatch(login(res.data.key))
        dispatch(setLoadingLogin(false))
        dispatch(push('/recipes'))
      })
      .catch(err => {
        dispatch(setLoadingLogin(false))
        const badRequest = err.response.status === 400
        if (err.response && badRequest) {
          const data = err.response.data
          dispatch(setErrorLogin({
            email: data['email'],
            password1: data['password1'],
            nonFieldErrors: data['non_field_errors']
          }))
        }
        dispatch(showNotificationWithTimeout({
          message: 'problem authenticating',
          level: 'danger',
          sticky: true
        }))
        console.warn('error with login', err)
      })
  }
}

export const setLoadingSignup = val => {
  return {
    type: SET_LOADING_SIGNUP,
    val
  }
}

export const setErrorSignup = val => {
  return {
    type: SET_ERROR_SIGNUP,
    val
  }
}

function sendSignupInfo (email, password1, password2) {
  return axios.post('/api/v1/rest-auth/registration/', { email, password1, password2 })
}

export const signup = (email, password1, password2) => dispatch => {
  dispatch(setLoadingSignup(true))
  // clear previous signup errors
  dispatch(setErrorSignup({}))
  dispatch(clearNotification())
  return sendSignupInfo(email, password1, password2)
    .then(res => {
      dispatch(login(res.data.key))
      dispatch(setLoadingSignup(false))
      dispatch(push('/recipes'))
    })
    .catch(err => {
      const badRequest = err.response.status === 400
      if (err.response && badRequest) {
        const data = err.response.data
        dispatch(setErrorSignup({
          email: data['email'],
          password1: data['password1'],
          password2: data['password2'],
          nonFieldErrors: data['non_field_errors']
        }))
      }
      dispatch(setLoadingSignup(false))
      console.warn('error with registration', err)
    })
}

export const setLoadingReset = val => {
  return {
    type: SET_LOADING_RESET,
    val
  }
}

export const setErrorReset = val => {
  return {
    type: SET_ERROR_RESET,
    val
  }
}

const sendReset = email =>
  axios.post('/api/v1/rest-auth/password/reset/', { email })

export const reset = email => dispatch => {
  dispatch(setLoadingReset(true))
  dispatch(setErrorReset({}))
  dispatch(clearNotification())
  return sendReset(email)
    .then(res => {
      dispatch(setLoadingReset(false))
      const message = res && res.data && res.data.detail
      dispatch(showNotificationWithTimeout({ message, level: 'success' }))
    })
    .catch(err => {
      dispatch(setLoadingReset(false))
      dispatch(showNotificationWithTimeout({
        message: 'uh oh! problem resetting password',
        level: 'danger',
        sticky: true
      }))
      console.warn('error with password reset', err)
      const badRequest = err.response.status === 400
      if (err.response && badRequest) {
        const data = err.response.data
        console.log(data)
        dispatch(setErrorReset({
          email: data['email'],
          nonFieldErrors: data['non_field_errors']
        }))
      }
      dispatch(showNotificationWithTimeout({
        message: 'problem resetting password',
        level: 'danger',
        sticky: true
      }))
    })
}

export const setNotification = ({ message, closeable, level }) => {
  return {
    type: SET_NOTIFICATION,
    message,
    closeable,
    level
  }
}

// https://stackoverflow.com/a/38574266/3555105
let notificationTimeout = null
const showNotificationWithTimeout = ({
  message,
  level,
  closeable = true,
  delay = 2000,
  sticky
}) => dispatch => {
  clearTimeout(notificationTimeout)
  dispatch(setNotification({ message, level, closeable }))

  if (!sticky) {
    notificationTimeout = setTimeout(() => {
      dispatch(clearNotification())
    }, delay)
  }
}

export const clearNotification = () => {
  return {
    type: CLEAR_NOTIFICATION
  }
}
