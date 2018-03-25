import {
  LOG_IN,
  LOG_OUT,
  ADD_RECIPE,
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
  SET_ERROR_SOCIAL_LOGIN,
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
  SET_LOADING_SHOPPING_LIST,
  SET_LOADING_USER_STATS,
  SET_USER_STATS,
  DELETE_RECIPE,
  SET_LOADING_RECIPE,
  SET_DELETING_RECIPE,
  SET_RECIPE,
  SET_ADDING_INGREDIENT_TO_RECIPE,
  SET_UPDATING_INGREDIENT,
  SET_REMOVING_INGREDIENT,
  SET_UPDATING_STEP,
  SET_REMOVING_STEP,
  SET_UPDATING_USER_EMAIL,
  SET_RECIPE_404,
  SET_LOGGING_OUT,
  SET_RECIPE_UPDATING,
  SET_CLEARING_CART,
  SET_SHOPPING_LIST_ERROR,
  SET_SOCIAL_ACCOUNT_CONNECTIONS,
  SET_LOADING_RESET_CONFIRMATION,
  SET_ERROR_RESET_CONFIRMATION,
  TOGGLE_DARK_MODE,
  SET_RECIPE_CART_AMOUNT,
  CLEAR_RECIPE_CART_AMOUNTS,
  SET_ADD_RECIPE_FORM_NAME,
  SET_ADD_RECIPE_FORM_AUTHOR,
  SET_ADD_RECIPE_FORM_SOURCE,
  SET_ADD_RECIPE_FORM_TIME,
  SET_ADD_RECIPE_FORM_SERVINGS,
  SET_ADD_RECIPE_FORM_TEAM,
  ADD_ADD_RECIPE_FORM_INGREDIENT,
  REMOVE_ADD_RECIPE_FORM_INGREDIENT,
  UPDATE_ADD_RECIPE_FORM_INGREDIENT,
  ADD_ADD_RECIPE_FORM_STEP,
  REMOVE_ADD_RECIPE_FORM_STEP,
  UPDATE_ADD_RECIPE_FORM_STEP,
  CLEAR_ADD_RECIPE_FORM,
  SET_SOCIAL_ACCOUNT_CONNECTION,
  SET_PASSWORD_USABLE,
  SET_FROM_URL,
  ADD_TEAM,
  SET_LOADING_TEAM,
  SET_LOADING_TEAM_MEMBERS,
  SET_LOADING_TEAM_RECIPES,
  SET_TEAM_404,
  SET_TEAM_MEMBERS,
  SET_TEAM_RECIPES,
  SET_UPDATING_USER_TEAM_LEVEL,
  SET_USER_TEAM_LEVEL,
  SET_DELETING_MEMBERSHIP,
  DELETE_MEMBERSHIP,
  SET_USER_ID,
  SET_SENDING_TEAM_INVITES,
  SET_TEAMS,
  SET_LOADING_TEAMS,
  SET_TEAM,
  SET_CREATING_TEAM,
  SET_MOVING_TEAM,
  SET_COPYING_TEAM,
  SET_INVITES,
  SET_LOADING_INVITES,
  SET_ERROR_FETCHING_INVITES,
  SET_DECLINING_INVITE,
  SET_ACCEPTING_INVITE,
  SET_DECLINED_INVITE,
  SET_ACCEPTED_INVITE,
  DELETE_TEAM,
  UPDATE_TEAM,
} from './actionTypes'

import {
  push,
  replace
} from 'react-router-redux'

import axios from 'axios'
import raven from 'raven-js'

import { store } from './store'

const config = { timeout: 15000 }

const http = axios.create(config)
const anon = axios.create(config)

const handleResponseError = error => {
  // 503 means we are in maintenance mode. Reload to show maintenance page.
  const maintenanceMode = error.response && error.response.status === 503
  // Report all 500 errors
  const serverError = !maintenanceMode && error.response && error.response.status >= 500
  // Report request timeouts
  const requestTimeout = error.code === 'ECONNABORTED'
  if (maintenanceMode) {
    location.reload()
  } else if (serverError || requestTimeout) {
    raven.captureException(error)
  }
  return Promise.reject(error)
}

http.interceptors.response.use(
  response => response,
  error => handleResponseError(error))

anon.interceptors.response.use(
  response => response,
  error => handleResponseError(error))

http.interceptors.request.use(
  config => {
    config.headers['Authorization'] = 'Token ' + store.getState().user.token
    return config
  }, error => Promise.reject(error)
)

const invalidToken = res =>
  res != null && res.data.detail === 'Invalid token.' && res.status === 401

const badRequest = err => err.response && err.response.status === 400

const is404 = err => err.response.status === 404

export const setNotification = ({
  message,
  closeable,
  level
}) => ({
  type: SET_NOTIFICATION,
  message,
  closeable,
  level
})

export const clearNotification = () => ({
  type: CLEAR_NOTIFICATION
})

// https://stackoverflow.com/a/38574266/3555105
let notificationTimeout = null
export const showNotificationWithTimeout = ({
  message,
  level,
  closeable = true,
  delay = 2000,
  sticky
}) => dispatch => {
  clearTimeout(notificationTimeout)
  dispatch(setNotification({
    message,
    level,
    closeable
  }))

  if (!sticky) {
    notificationTimeout = setTimeout(() => {
      dispatch(clearNotification())
    }, delay)
  }
}

export const login = (token, user) => ({
  type: LOG_IN,
  token,
  user
})

export const logout = () => ({
  type: LOG_OUT
})

export const setLoggingOut = val => ({
  type: SET_LOGGING_OUT,
  val
})

export const loggingOut = () => dispatch => {
  dispatch(setLoggingOut(true))
  return http.post('/api/v1/rest-auth/logout/', {})
  .then(() => {
    dispatch(logout())
    dispatch(push('/login'))
    dispatch(setLoggingOut(false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setLoggingOut(false))
    throw err
  })
}

export const setLoadingUser = val => ({
  type: SET_LOADING_USER,
  val
})

export const setErrorUser = val => ({
  type: SET_ERROR_USER,
  val
})

export const setLoadingUserStats = val => ({
  type: SET_LOADING_USER_STATS,
  val
})

export const setUserStats = val => ({
  type: SET_USER_STATS,
  val
})

export const setAvatarURL = url => ({
  type: SET_AVATAR_URL,
  url
})

export const setUserEmail = email => ({
  type: SET_USER_EMAIL,
  email
})

export const setPasswordUsable = val => ({
  type: SET_PASSWORD_USABLE,
  val
})

export const setUpdatingUserEmail = val => ({
  type: SET_UPDATING_USER_EMAIL,
  val
})

export const setFromUrl = val => ({
  type: SET_FROM_URL,
  val
})

const emailExists = err =>
  err.response.data.email != null &&
  err.response.data.email[0].includes('email already exists')

const second = 1000

export const updatingEmail = email => dispatch => {
  dispatch(setUpdatingUserEmail(true))
  return http.patch('/api/v1/rest-auth/user/', {
    email
  })
  .then(res => {
    dispatch(setUserEmail(res.data.email))
    dispatch(setAvatarURL(res.data.avatar_url))
    dispatch(setUpdatingUserEmail(false))
    dispatch(showNotificationWithTimeout({
      message: 'updated email',
      level: 'success',
      delay: 3 * second
    }))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setUpdatingUserEmail(false))
    const messageExtra = emailExists(err) ? '- email already in use' : ''
    dispatch(setNotification({
      message: `problem updating email ${messageExtra}`,
      level: 'danger'
    }))
  })
}

export const setUserID = (id) => ({
  type: SET_USER_ID,
  id,
})

export const fetchUser = () => dispatch => {
  dispatch(setLoadingUser(true))
  dispatch(setErrorUser(false))
  return http.get('/api/v1/rest-auth/user/')
  .then(res => {
    dispatch(setUserID(res.data.id))
    dispatch(setAvatarURL(res.data.avatar_url))
    dispatch(setUserEmail(res.data.email))
    dispatch(setPasswordUsable(res.data.has_usable_password))
    dispatch(setLoadingUser(false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setLoadingUser(false))
    dispatch(setErrorUser(true))
    throw err
  })
}

export const setSocialConnections = val => ({
  type: SET_SOCIAL_ACCOUNT_CONNECTIONS,
  val
})

export const setSocialConnection = (provider, val) => ({
  type: SET_SOCIAL_ACCOUNT_CONNECTION,
  provider,
  val,
})

export const fetchSocialConnections = () => dispatch => {
  return http.get('/api/v1/rest-auth/socialaccounts/')
  .then(res => {
    dispatch(setSocialConnections(res.data))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    throw err
  })
}

export const disconnectSocialAccount = (provider, id) => dispatch => {
  return http.post(`/api/v1/rest-auth/socialaccounts/${id}/disconnect/`, {
    id
  })
  .then(() => {
    dispatch(setSocialConnections(
      [{
        provider: provider,
        id: null
      }]
    ))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    throw err
  })
}

export const fetchUserStats = () => dispatch => {
  dispatch(setLoadingUserStats(true))
  return http.get('api/v1/user_stats/')
  .then(res => {
    dispatch(setUserStats(res.data))
    dispatch(setLoadingUserStats(false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setLoadingUserStats(false))
    throw err
  })
}

export const setLoadingPasswordUpdate = val => ({
  type: SET_LOADING_PASSWORD_UPDATE,
  val
})

export const setErrorPasswordUpdate = val => ({
  type: SET_ERROR_PASSWORD_UPDATE,
  val
})

export const updatingPassword = (password1, password2, oldPassword) => dispatch => {
  dispatch(setLoadingPasswordUpdate(true))
  dispatch(setErrorPasswordUpdate({}))
  return http.post('/api/v1/rest-auth/password/change/', {
    new_password1: password1,
    new_password2: password2,
    old_password: oldPassword
  })
  .then(() => {
    dispatch(setLoadingPasswordUpdate(false))
    dispatch(push('/'))
    dispatch(showNotificationWithTimeout({
      message: 'Successfully updated password',
      level: 'success'
    }))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setLoadingPasswordUpdate(false))
    const badRequest = err.response.status === 400
    if (err.response && badRequest) {
      const data = err.response.data
      dispatch(setErrorPasswordUpdate({
        newPasswordAgain: data['new_password2'],
        newPassword: data['new_password1'],
        oldPassword: data['old_password']
      }))
    }
    throw err
  })
}

export const setLoadingCart = val => ({
  type: SET_LOADING_CART,
  val
})

export const setErrorCart = val => ({
  type: SET_ERROR_CART,
  val
})

export const setClearingCart = val => ({
  type: SET_CLEARING_CART,
  val
})

export const setShoppingList = val => ({
  type: SET_SHOPPING_LIST,
  val
})

export const setShoppingListEmpty = () =>
  setShoppingList([])

export const clearRecipeCartAmounts = () => ({
  type: CLEAR_RECIPE_CART_AMOUNTS
})

export const clearCart = () => dispatch => {
  dispatch(setClearingCart(true))
  return http.post('/api/v1/clear_cart/', {})
  .then(() => {
    dispatch(clearRecipeCartAmounts())
    dispatch(setShoppingListEmpty())
    dispatch(setClearingCart(false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setClearingCart(false))
    dispatch(showNotificationWithTimeout({
      message: 'error clearing cart',
      level: 'danger',
      delay: 3 * second
    }))
    throw err
  })
}

export const setRecipeCartAmount = (id, count) => ({
  type: SET_RECIPE_CART_AMOUNT,
  id,
  count
})

export const setRecipeAddingToCart = (id, loading) => ({
  type: SET_RECIPE_ADDING_TO_CART,
  id,
  loading
})

export const addingToCart = id => (dispatch, getState) => {
  // we increment the cart value by 1, since we know the default / min cart
  // value is ensured to be 0 via the backend
  const count = getState().recipes[id].cart_count + 1
  dispatch(setRecipeAddingToCart(id, true))
  return updatingCart(id, count)(dispatch, getState)
  .then(() => {
    dispatch(setRecipeAddingToCart(id, false))
  })
  .catch(err => {
    dispatch(setRecipeAddingToCart(id, false))
    throw err
  })
}

export const updatingCart = (id, count) => dispatch =>
  http.patch(`/api/v1/cart/${id}/`, {
    count
  })
  .then(res => {
    const {
      recipe,
      count
    } = res.data
    dispatch(setRecipeCartAmount(recipe, count))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    throw err
  })

export const setRecipeRemovingFromCart = (id, loading) => ({
  type: SET_RECIPE_REMOVING_FROM_CART,
  id,
  loading
})

export const removingFromCart = id => (dispatch, getState) => {
  const currentCount = getState().recipes[id].cart_count
  const count = currentCount > 0 ? currentCount - 1 : 0
  dispatch(setRecipeRemovingFromCart(id, true))
  return updatingCart(id, count)(dispatch, getState)
  .then(() => {
    dispatch(setRecipeRemovingFromCart(id, false))
  })
  .catch(err => {
    dispatch(setRecipeRemovingFromCart(id, false))
    throw err
  })
}

export const setLoadingShoppingList = val => ({
  type: SET_LOADING_SHOPPING_LIST,
  val
})

export const setShoppingListError = val => ({
  type: SET_SHOPPING_LIST_ERROR,
  val
})

export const fetchShoppingList = () => dispatch => {
  dispatch(setLoadingShoppingList(true))
  dispatch(setShoppingListError(false))
  return http.get('/api/v1/shoppinglist/')
  .then(res => {
    dispatch(setShoppingList(res.data))
    dispatch(setLoadingShoppingList(false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setShoppingListError(true))
    dispatch(setLoadingShoppingList(false))
  })
}

export const addRecipe = recipe => ({
  type: ADD_RECIPE,
  recipe
})

export const setLoadingAddRecipe = val => ({
  type: SET_LOADING_ADD_RECIPE,
  val
})

export const setErrorAddRecipe = val => ({
  type: SET_ERROR_ADD_RECIPE,
  val
})

export const postNewRecipe = recipe => dispatch => {
  dispatch(setLoadingAddRecipe(true))
  dispatch(setErrorAddRecipe({}))

  return http.post('/api/v1/recipes/', recipe)
  .then(res => {
    dispatch(addRecipe(res.data))
    dispatch(clearAddRecipeForm())
    dispatch(setLoadingAddRecipe(false))
    dispatch(push('/recipes'))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    const errors = {
      errorWithName: err.response.data.name != null,
      errorWithIngredients: err.response.data.ingredients != null,
      errorWithSteps: err.response.data.steps != null
    }
    dispatch(setLoadingAddRecipe(false))
    dispatch(setErrorAddRecipe(errors))

    dispatch(showNotificationWithTimeout({
      message: 'problem creating new recipe',
      level: 'danger',
      delay: 5 * second
    }))
  })
}

export const setRecipe404 = (id, val) => ({
  type: SET_RECIPE_404,
  id,
  val
})

export const setLoadingRecipe = (id, val) => ({
  type: SET_LOADING_RECIPE,
  id,
  val
})

export const fetchRecipe = id => dispatch => {
  dispatch(setRecipe404(id, false))
  dispatch(setLoadingRecipe(id, true))
  return http.get(`/api/v1/recipes/${id}/`)
  .then(res => {
    dispatch(addRecipe(res.data))
    dispatch(setLoadingRecipe(id, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    if (err.response.status === 404) {
      dispatch(setRecipe404(id, true))
    }
    dispatch(setLoadingRecipe(id, false))
    throw err
  })
}

export const setRecipes = recipes => ({
  type: SET_RECIPES,
  recipes
})

export const setErrorRecipes = val => ({
  type: SET_ERROR_RECIPES,
  val
})

export const setLoadingRecipes = val => ({
  type: SET_LOADING_RECIPES,
  val
})

export const fetchRecentRecipes = () => dispatch => {
  dispatch(setLoadingRecipes(true))
  dispatch(setErrorRecipes(false))
  return http.get('/api/v1/recipes/?recent')
  .then(res => {
    dispatch(setRecipes(res.data))
    dispatch(setLoadingRecipes(false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setErrorRecipes(true))
    dispatch(setLoadingRecipes(false))
    throw err
  })
}

export const fetchRecipeList = () => dispatch => {
  dispatch(setLoadingRecipes(true))
  dispatch(setErrorRecipes(false))

  return http.get('/api/v1/recipes/')
  .then(res => {
    dispatch(setRecipes(res.data))
    dispatch(setLoadingRecipes(false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setErrorRecipes(true))
    dispatch(setLoadingRecipes(false))
  })
}

export const setLoadingAddStepToRecipe = (id, val) => ({
  type: SET_LOADING_ADD_STEP_TO_RECIPE,
  id,
  val
})

export const addStepToRecipe = (id, step) => ({
  type: ADD_STEP_TO_RECIPE,
  id,
  step
})

export const setAddingIngredientToRecipe = (id, val) => ({
  type: SET_ADDING_INGREDIENT_TO_RECIPE,
  id,
  val
})

export const addIngredientToRecipe = (id, ingredient) => ({
  type: ADD_INGREDIENT_TO_RECIPE,
  id,
  ingredient
})

export const addingRecipeIngredient = (recipeID, ingredient) => dispatch => {
  dispatch(setAddingIngredientToRecipe(recipeID, true))
  return http.post(`/api/v1/recipes/${recipeID}/ingredients/`, ingredient)
  .then(res => {
    dispatch(addIngredientToRecipe(recipeID, res.data))
    dispatch(setAddingIngredientToRecipe(recipeID, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setAddingIngredientToRecipe(recipeID, false))
    throw err
  })
}

export const updateRecipeName = (id, name) => ({
  type: UPDATE_RECIPE_NAME,
  id,
  name
})

export const sendUpdatedRecipeName = (id, name) => dispatch => {
  return http.patch(`/api/v1/recipes/${id}/`, {
    name
  })
  .then(res => {
    dispatch(updateRecipeName(res.data.id, res.data.name))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    throw err
  })
}

export const updateRecipeSource = (id, source) => ({
  type: UPDATE_RECIPE_SOURCE,
  id,
  source
})

export const setRecipeSource = (id, source) => dispatch => {
  return http.patch(`/api/v1/recipes/${id}/`, {
    source
  })
  .then(res => {
    dispatch(updateRecipeSource(res.data.id, res.data.source))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    throw err
  })
}

export const updateRecipeAuthor = (id, author) => ({
  type: UPDATE_RECIPE_AUTHOR,
  id,
  author
})

export const setRecipeAuthor = (id, author) => dispatch => {
  return http.patch(`/api/v1/recipes/${id}/`, {
    author
  })
  .then(res => {
    dispatch(updateRecipeAuthor(res.data.id, res.data.author))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    throw err
  })
}

export const updateRecipeTime = (id, time) => ({
  type: UPDATE_RECIPE_TIME,
  id,
  time
})

export const setRecipeTime = (id, time) => dispatch => {
  return http.patch(`/api/v1/recipes/${id}/`, {
    time
  })
  .then(res => {
    dispatch(updateRecipeTime(res.data.id, res.data.time))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    throw err
  })
}

export const toggleDarkMode = () => ({
  type: TOGGLE_DARK_MODE
})

export const setRecipe = (id, data) => ({
  type: SET_RECIPE,
  id,
  data
})

export const setRecipeUpdating = (id, val) => ({
  type: SET_RECIPE_UPDATING,
  id,
  val
})

export const updateRecipe = (id, data) => dispatch => {
  dispatch(setRecipeUpdating(id, true))
  return http.patch(`/api/v1/recipes/${id}/`, data)
  .then(res => {
    dispatch(setRecipe(res.data.id, res.data))
    dispatch(setRecipeUpdating(id, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setRecipeUpdating(id, false))
    throw err
  })
}

export const updateIngredient = (recipeID, ingredientID, content) => ({
  type: UPDATE_INGREDIENT,
  recipeID,
  ingredientID,
  content
})

export const addingRecipeStep = (recipeID, step) => dispatch => {
  dispatch(setLoadingAddStepToRecipe(recipeID, true))
  return http.post(`/api/v1/recipes/${recipeID}/steps/`, {
    text: step
  })
  .then(res => {
    dispatch(addStepToRecipe(recipeID, res.data))
    dispatch(setLoadingAddStepToRecipe(recipeID, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setLoadingAddStepToRecipe(recipeID, false))
    throw err
  })
}

export const setRemovingIngredient = (recipeID, ingredientID, val) => ({
  type: SET_REMOVING_INGREDIENT,
  recipeID,
  ingredientID,
  val
})

export const setUpdatingIngredient = (recipeID, ingredientID, val) => ({
  type: SET_UPDATING_INGREDIENT,
  recipeID,
  ingredientID,
  val
})

export const updatingIngredient = (recipeID, ingredientID, content) => dispatch => {
  dispatch(setUpdatingIngredient(recipeID, ingredientID, true))
  return http.patch(`/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`, content)
  .then(res => {
    dispatch(updateIngredient(recipeID, ingredientID, res.data))
    dispatch(setUpdatingIngredient(recipeID, ingredientID, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setUpdatingIngredient(recipeID, ingredientID, false))
    throw err
  })
}

export const deleteIngredient = (recipeID, ingredientID) => ({
  type: DELETE_INGREDIENT,
  recipeID,
  ingredientID
})

export const deletingIngredient = (recipeID, ingredientID) => dispatch => {
  dispatch(setRemovingIngredient(recipeID, ingredientID, true))
  return http.delete(`/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`)
  .then(() => {
    dispatch(setRemovingIngredient(recipeID, ingredientID, false))
    dispatch(deleteIngredient(recipeID, ingredientID))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setRemovingIngredient(recipeID, ingredientID, false))
    throw err
  })
}

export const updateStep = (recipeID, stepID, text) => ({
  type: UPDATE_STEP,
  recipeID,
  stepID,
  text
})

export const setRemovingStep = (recipeID, stepID, val) => ({
  type: SET_REMOVING_STEP,
  recipeID,
  stepID,
  val
})

export const setUpdatingStep = (recipeID, stepID, val) => ({
  type: SET_UPDATING_STEP,
  recipeID,
  stepID,
  val
})

export const updatingStep = (recipeID, stepID, text) => dispatch => {
  dispatch(setUpdatingStep(recipeID, stepID, true))
  return http.patch(`/api/v1/recipes/${recipeID}/steps/${stepID}/`, {
    text
  })
  .then(res => {
    const text = res.data.text
    dispatch(updateStep(recipeID, stepID, text))
    dispatch(setUpdatingStep(recipeID, stepID, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setUpdatingStep(recipeID, stepID, false))
    throw err
  })
}

export const deleteStep = (recipeID, stepID) => ({
  type: DELETE_STEP,
  recipeID,
  stepID
})

export const deletingStep = (recipeID, stepID) => dispatch => {
  dispatch(setRemovingStep(recipeID, stepID, true))
  return http.delete(`/api/v1/recipes/${recipeID}/steps/${stepID}/`)
  .then(() => {
    dispatch(deleteStep(recipeID, stepID))
    dispatch(setRemovingStep(recipeID, stepID, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setRemovingStep(recipeID, stepID, false))
    throw err
  })
}

export const setErrorLogin = val => ({
  type: SET_ERROR_LOGIN,
  val
})

export const setLoadingLogin = val => ({
  type: SET_LOADING_LOGIN,
  val
})

export const logUserIn = (email, password, redirectUrl = '') => dispatch => {
  dispatch(setLoadingLogin(true))
  dispatch(setErrorLogin({}))
  dispatch(clearNotification())
  return anon.post('/api/v1/rest-auth/login/', {
    email,
    password
  })
  .then(res => {
    dispatch(login(res.data.key, res.data.user))
    dispatch(setLoadingLogin(false))
    dispatch(push(redirectUrl))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
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
  })
}

export const setErrorSocialLogin = val => ({
  type: SET_ERROR_SOCIAL_LOGIN,
  val
})

export const socialLogin = (service, token, redirectUrl = '') => dispatch => {
  return anon.post(`/api/v1/rest-auth/${service}/`, {
    code: token
  })
  .then(res => {
    dispatch(login(res.data.key, res.data.user))
    dispatch(replace(redirectUrl))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    const badRequest = err.response.status === 400
    if (err.response && badRequest) {
      const data = err.response.data
      dispatch(setErrorSocialLogin({
        emailSocial: data['email'],
        nonFieldErrorsSocial: data['non_field_errors']
      }))
    }
    dispatch(replace('/login'))
    throw err
  })
}

export const socialConnect = (service, code) => dispatch => {
  return http.post(`/api/v1/rest-auth/${service}/connect/`, {
    code
  })
  .then(() => {
    dispatch(replace('/settings'))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(replace('/settings'))
    throw err
  })
}

export const setLoadingSignup = val => ({
  type: SET_LOADING_SIGNUP,
  val
})

export const setErrorSignup = val => ({
  type: SET_ERROR_SIGNUP,
  val
})

export const signup = (email, password1, password2) => dispatch => {
  dispatch(setLoadingSignup(true))
    // clear previous signup errors
  dispatch(setErrorSignup({}))
  dispatch(clearNotification())
  return anon.post('/api/v1/rest-auth/registration/', {
    email,
    password1,
    password2
  })
  .then(res => {
    dispatch(login(res.data.key, res.data.user))
    dispatch(setLoadingSignup(false))
    dispatch(push('/recipes/add'))
  })
  .catch(err => {
    if (badRequest(err)) {
      const data = err.response.data
      dispatch(setErrorSignup({
        email: data['email'],
        password1: data['password1'],
        password2: data['password2'],
        nonFieldErrors: data['non_field_errors']
      }))
    }
    dispatch(setLoadingSignup(false))
  })
}

export const setDeletingRecipe = (id, val) => ({
  type: SET_DELETING_RECIPE,
  id,
  val
})

export const deleteRecipe = id => ({
  type: DELETE_RECIPE,
  id
})

export const deletingRecipe = id => dispatch => {
  dispatch(setDeletingRecipe(id, true))
  return http.delete(`/api/v1/recipes/${id}/`)
  .then(() => {
    dispatch(deleteRecipe(id))
    dispatch(setDeletingRecipe(id, false))
    dispatch(push('/recipes'))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setDeletingRecipe(id, false))
    throw err
  })
}

export const setLoadingReset = val => ({
  type: SET_LOADING_RESET,
  val
})

export const setErrorReset = val => ({
  type: SET_ERROR_RESET,
  val
})

export const reset = email => dispatch => {
  dispatch(setLoadingReset(true))
  dispatch(setErrorReset({}))
  dispatch(clearNotification())
  return anon.post('/api/v1/rest-auth/password/reset/', {
    email
  })
  .then(res => {
    dispatch(setLoadingReset(false))
    const message = res && res.data && res.data.detail
    dispatch(showNotificationWithTimeout({
      message,
      level: 'success'
    }))
  })
  .catch(err => {
    dispatch(setLoadingReset(false))
    dispatch(showNotificationWithTimeout({
      message: 'uh oh! problem resetting password',
      level: 'danger',
      sticky: true
    }))
    if (badRequest(err)) {
      const data = err.response.data
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

export const setLoadingResetConfirmation = val => ({
  type: SET_LOADING_RESET_CONFIRMATION,
  val
})

export const setErrorResetConfirmation = val => ({
  type: SET_ERROR_RESET_CONFIRMATION,
  val
})

export const resetConfirmation = (uid, token, newPassword1, newPassword2) => dispatch => {
  dispatch(setLoadingResetConfirmation(true))
  dispatch(setErrorResetConfirmation({}))
  dispatch(clearNotification())
  return anon.post('/api/v1/rest-auth/password/reset/confirm/', {
    uid,
    token,
    new_password1: newPassword1,
    new_password2: newPassword2
  })
  .then(res => {
    dispatch(setLoadingResetConfirmation(false))
    const message = res && res.data && res.data.detail
    dispatch(showNotificationWithTimeout({
      message,
      level: 'success'
    }))
    dispatch(push('/login'))
  })
  .catch(err => {
    dispatch(setLoadingResetConfirmation(false))
    dispatch(showNotificationWithTimeout({
      message: 'uh oh! problem resetting password',
      level: 'danger',
      sticky: true
    }))
    if (badRequest(err)) {
      const data = err.response.data

      const tokenData = data['token'] && data['token'].map(x => 'token: ' + x)
      const uidData = data['uid'] && data['uid'].map(x => 'uid: ' + x)
      const nonFieldErrors = [].concat(data['non_field_errors']).concat(tokenData).concat(uidData)

      dispatch(setErrorReset({
        newPassword1: data['new_password1'],
        newPassword2: data['new_password2'],
        nonFieldErrors
      }))
    }
  })
}

export const setAddRecipeFormName = val => ({
  type: SET_ADD_RECIPE_FORM_NAME,
  val
})

export const setAddRecipeFormAuthor = val => ({
  type: SET_ADD_RECIPE_FORM_AUTHOR,
  val
})

export const setAddRecipeFormSource = val => ({
  type: SET_ADD_RECIPE_FORM_SOURCE,
  val
})

export const setAddRecipeFormTime = val => ({
  type: SET_ADD_RECIPE_FORM_TIME,
  val
})

export const setAddRecipeFormServings = val => ({
  type: SET_ADD_RECIPE_FORM_SERVINGS,
  val
})

export const setAddRecipeFormTeam = val => ({
  type: SET_ADD_RECIPE_FORM_TEAM,
  val,
})

export const addAddRecipeFormIngredient = ingredient => ({
  type: ADD_ADD_RECIPE_FORM_INGREDIENT,
  ingredient
})

export const removeAddRecipeFormIngredient = index => ({
  type: REMOVE_ADD_RECIPE_FORM_INGREDIENT,
  index
})

export const addAddRecipeFormStep = step => ({
  type: ADD_ADD_RECIPE_FORM_STEP,
  step
})

export const removeAddRecipeFormStep = index => ({
  type: REMOVE_ADD_RECIPE_FORM_STEP,
  index
})

export const updateAddRecipeFormIngredient = (index, ingredient) => ({
  type: UPDATE_ADD_RECIPE_FORM_INGREDIENT,
  index,
  ingredient
})

export const updateAddRecipeFormStep = (index, step) => ({
  type: UPDATE_ADD_RECIPE_FORM_STEP,
  index,
  step
})

export const clearAddRecipeForm = () => ({
  type: CLEAR_ADD_RECIPE_FORM
})

export const addTeam = team => ({
  type: ADD_TEAM,
  team
})

export const setLoadingTeam = (id, loadingTeam) => ({
  type: SET_LOADING_TEAM,
  id,
  loadingTeam,
})

export const setLoadingTeamMembers = (id, loadingMembers) => ({
  type: SET_LOADING_TEAM_MEMBERS,
  id,
  loadingMembers,
})

export const setTeam404 = (id, val = true) => ({
  type: SET_TEAM_404,
  id,
  val,
})

export const setTeamMembers = (id, members) => ({
  type: SET_TEAM_MEMBERS,
  id,
  members,
})

export const setTeamRecipes = (id, recipes) => ({
  type: SET_TEAM_RECIPES,
  id,
  recipes,
})

export const setLoadingTeamRecipes = (id, loadingRecipes) => ({
  type: SET_LOADING_TEAM_RECIPES,
  id,
  loadingRecipes,
})

export const fetchTeam = id => dispatch => {
  dispatch(setLoadingTeam(id, true))
  return http.get(`/api/v1/t/${id}/`)
  .then(res => {
    dispatch(addTeam(res.data))
    dispatch(setLoadingTeam(id, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    if (is404(err)) {
      dispatch(setTeam404(id))
    }
    dispatch(setLoadingTeam(id, false))
    throw err
  })
}

export const fetchTeamMembers = id => dispatch => {
  dispatch(setLoadingTeamMembers(id, true))
  return http.get(`/api/v1/t/${id}/members/`)
  .then(res => {
    dispatch(setTeamMembers(id, res.data))
    dispatch(setLoadingTeamMembers(id, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setLoadingTeamMembers(id, false))
    throw err
  })
}

export const fetchTeamRecipes = id => dispatch => {
  dispatch(setLoadingTeamRecipes(id, true))
  return http.get(`/api/v1/t/${id}/recipes/`)
  .then(res => {
    dispatch(setRecipes(res.data))
    dispatch(setTeamRecipes(id, res.data))
    dispatch(setLoadingTeamRecipes(id, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    dispatch(setLoadingTeamRecipes(id, false))
    throw err
  })
}

export const setUpdatingUserTeamLevel = (id, updating) => ({
  type: SET_UPDATING_USER_TEAM_LEVEL,
  id,
  updating,
})

export const setUserTeamLevel = (teamID, membershipID, level) => ({
  type: SET_USER_TEAM_LEVEL,
  teamID,
  membershipID,
  level,
})

const attemptedDeleteLastAdmin = res =>
  res.status === 400 && res.data.level && res.data.level[0].includes('cannot demote')

export const settingUserTeamLevel = (teamID, membershipID, level) => dispatch => {
  dispatch(setUpdatingUserTeamLevel(teamID, true))
  return http.patch(`/api/v1/t/${teamID}/members/${membershipID}/`, { level })
  .then(res => {
    dispatch(setUserTeamLevel(teamID, membershipID, res.data.level))
    dispatch(setUpdatingUserTeamLevel(teamID, false))
  })
  .catch(err => {
    if (invalidToken(err.response)) {
      dispatch(logout())
    }
    if (attemptedDeleteLastAdmin(err.response)) {
      const message = err.response.data.level[0]
      dispatch(showNotificationWithTimeout({
        message,
        level: 'danger',
        delay: 3 * second
      }))
    }
    dispatch(setUpdatingUserTeamLevel(teamID, false))
    throw err
  })
}

export const deleteMembership = (teamID, membershipID) => ({
  type: DELETE_MEMBERSHIP,
  teamID,
  membershipID
})

export const setDeletingMembership = (teamID, membershipID, val) => ({
  type: SET_DELETING_MEMBERSHIP,
  teamID,
  membershipID,
  val,
})

export const deleteTeam = (id) => ({
  type: DELETE_TEAM,
  id,
})

export const deletingMembership = (teamID, id, leaving = false) => (dispatch, getState) => {
  dispatch(setDeletingMembership(teamID, id, true))
  return http.delete(`/api/v1/t/${teamID}/members/${id}/`)
  .then(() => {
    const message = 'left team ' + getState().teams[teamID].name
    dispatch(deleteMembership(teamID, id))
    if (leaving) {
      dispatch(push('/'))
      dispatch(showNotificationWithTimeout({
        message,
        level: 'success',
        delay: 3 * second
      }))
      dispatch(deleteTeam(teamID))
    }
  })
  .catch(err => {
    const message = err.response.data
    dispatch(showNotificationWithTimeout({
      message,
      level: 'danger',
      delay: 3 * second
    }))
    dispatch(setDeletingMembership(teamID, id, false))
    throw err
  })
}

export const deletingTeam = teamID => (dispatch, getState) => {
  return http.delete(`/api/v1/t/${teamID}`)
  .then(() => {
    dispatch(push('/'))
    const teamName = getState().teams[teamID].name
    dispatch(showNotificationWithTimeout({
      message: `Team deleted (${teamName})`,
      level: 'success',
      delay: 3 * second
    }))
    dispatch(deleteTeam(teamID))
  })
  .catch(err => {
    let message = 'Uh Oh! Something went wrong.'
    if (err.response && err.response.status === 403) {
      message = (err.response.data && err.response.data.detail)
      ? err.response.data.detail
      : 'You are not authorized to delete this team'
    } else if (err.response && err.response.status === 404) {
      message = (err.response.data && err.response.data.detail)
      ? err.response.data.detail
      : "The team you are attempting to delete doesn't exist"
    } else {
      raven.captureException(err)
    }
    dispatch(showNotificationWithTimeout({
      message,
      level: 'danger',
      delay: 3 * second
    }))
    throw err
  })
}

export const setSendingTeamInvites = (teamID, val) => ({
  type: SET_SENDING_TEAM_INVITES,
  teamID,
  val,
})

export const sendingTeamInvites = (teamID, emails, level) => dispatch => {
  dispatch(setSendingTeamInvites(teamID, true))
  return http.post(`/api/v1/t/${teamID}/invites/`, { emails, level })
  .then(() => {
    dispatch(showNotificationWithTimeout({
      message: 'invites sent!',
      level: 'success',
      delay: 3 * second
    }))
    dispatch(setSendingTeamInvites(teamID, false))
  })
  .catch(err => {
    // TODO: handle errors
    dispatch(setSendingTeamInvites(teamID, false))
    throw err
  })
}

export const setLoadingTeams = val => ({
  type: SET_LOADING_TEAMS,
  val,
})

export const setTeams = teams => ({
  type: SET_TEAMS,
  teams,
})

export const fetchTeams = () => dispatch => {
  dispatch(setLoadingTeams(true))
  return http.get('/api/v1/t/')
  .then(res => {
    dispatch(setTeams(res.data))
    dispatch(setLoadingTeams(false))
  })
  .catch(err => {
    dispatch(setLoadingTeams(false))
    throw err
  })
}

export const setTeam = (id, team) => ({
  type: SET_TEAM,
  id,
  team,
})

export const updateTeamById = (id, teamKeys) => ({
  type: UPDATE_TEAM,
  id,
  teamKeys,
})

export const setCreatingTeam = val => ({
  type: SET_CREATING_TEAM,
  val,
})

export const creatingTeam = (name, emails, level) => dispatch => {
  dispatch(setCreatingTeam(true))
  return http.post('/api/v1/t/', { name, emails, level })
  .then(res => {
    dispatch(setTeam(res.data.id, res.data))
    dispatch(setCreatingTeam(false))
    dispatch(push(`/t/${res.data.id}`))
  })
  .catch(err => {
    dispatch(setCreatingTeam(false))
    throw err
  })
}

export const setMovingTeam = val => ({
  type: SET_MOVING_TEAM,
  val,
})

export const setCopyingTeam = val => ({
  type: SET_COPYING_TEAM,
  val,
})

export const updatingTeam = (teamId, teamKVs) => dispatch => {
  return http.patch(`/api/v1/t/${teamId}/`, teamKVs)
  .then(res => {
    dispatch(showNotificationWithTimeout({
      message: 'Team updated',
      level: 'success',
      delay: 3 * second
    }))
    dispatch(updateTeamById(res.data.id, res.data))
  })
  .catch(err => {
    let message = 'Problem updating team.'
    if (err.response && err.response.status === 403) {
      message = 'You are not unauthorized to perform that action'
    }
    dispatch(showNotificationWithTimeout({
      message,
      level: 'danger',
      delay: 3 * second
    }))
    throw err
  })
}

export const moveRecipeTo = (recipeId, ownerId, type) => dispatch => {
  dispatch(setMovingTeam(true))
  return http.post(`/api/v1/recipes/${recipeId}/move/`, { id: ownerId, type })
  .then(res => {
    dispatch(addRecipe(res.data))
    dispatch(setMovingTeam(false))
  })
  .catch(err => {
    dispatch(setMovingTeam(false))
    throw err
  })
}

export const copyRecipeTo = (recipeId, ownerId, type) => dispatch => {
  dispatch(setCopyingTeam(true))
  return http.post(`/api/v1/recipes/${recipeId}/copy/`, { id: ownerId, type })
  .then(res => {
    dispatch(addRecipe(res.data))
    dispatch(setCopyingTeam(false))
  })
  .catch(err => {
    dispatch(setCopyingTeam(false))
    throw err
  })
}

export const setLoadingInvites = (val) => ({
  type: SET_LOADING_INVITES,
  val,
})

export const setInvites = (invites) => ({
  type: SET_INVITES,
  invites,
})

export const setErrorFetchingInvites = (val) => ({
  type: SET_ERROR_FETCHING_INVITES,
  val,
})

export const fetchInvites = () => dispatch => {
  dispatch(setLoadingInvites(true))
  dispatch(setErrorFetchingInvites(false))
  return http.get('/api/v1/invites/')
  .then(res => {
    dispatch(setInvites(res.data))
    dispatch(setLoadingInvites(false))
  })
  .catch(err => {
    dispatch(setLoadingInvites(false))
    dispatch(setErrorFetchingInvites(true))
    throw err
  })
}

export const setAcceptingInvite = (id, val) => ({
  type: SET_ACCEPTING_INVITE,
  id,
  val,
})

export const setAcceptedInvite = (id) => ({
  type: SET_ACCEPTED_INVITE,
  id,
})

export const acceptingInvite = (id) => dispatch => {
  dispatch(setAcceptingInvite(true))
  return http.post(`/api/v1/invites/${id}/accept/`, {})
  .then(() => {
    dispatch(setAcceptingInvite(false))
    dispatch(setAcceptedInvite(id))
  })
  .catch(err => {
    dispatch(setAcceptingInvite(false))
    throw err
  })
}

export const setDecliningInvite = (id, val) => ({
  type: SET_DECLINING_INVITE,
  id,
  val,
})

export const setDeclinedInvite = (id) => ({
  type: SET_DECLINED_INVITE,
  id,
})

export const decliningInvite = (id) => dispatch => {
  dispatch(setDecliningInvite(true))
  return http.post(`/api/v1/invites/${id}/decline/`, {})
  .then(() => {
    dispatch(setDecliningInvite(false))
    dispatch(setDeclinedInvite(id))
  })
  .catch(err => {
    dispatch(setDecliningInvite(false))
    throw err
  })
}
