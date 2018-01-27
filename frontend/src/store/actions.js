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
  ADD_ADD_RECIPE_FORM_INGREDIENT,
  REMOVE_ADD_RECIPE_FORM_INGREDIENT,
  UPDATE_ADD_RECIPE_FORM_INGREDIENT,
  ADD_ADD_RECIPE_FORM_STEP,
  REMOVE_ADD_RECIPE_FORM_STEP,
  UPDATE_ADD_RECIPE_FORM_STEP,
  CLEAR_ADD_RECIPE_FORM,
  SET_SOCIAL_ACCOUNT_CONNECTION,
} from './actionTypes'

import { push, replace } from 'react-router-redux'

import axios from 'axios'

axios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  // 503 means we are in maintenance mode. Reload to show maintenance page.
  if (error.response && error.response.status === 503) {
    location.reload()
  }
  return Promise.reject(error)
})

export const setNotification = ({ message, closeable, level }) => {
  return {
    type: SET_NOTIFICATION,
    message,
    closeable,
    level
  }
}

export const clearNotification = () => {
  return {
    type: CLEAR_NOTIFICATION
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

const invalidToken = res =>
  res != null && res.data.detail === 'Invalid token.' && res.status === 401

export const login = (token, user) => ({
  type: LOG_IN,
  token,
  user
})

export const logout = () => {
  return {
    type: LOG_OUT
  }
}

export const setLoggingOut = val => ({
  type: SET_LOGGING_OUT,
  val
})

const postLogout = token =>
  // empty body since post expects the second argument to be the body
  axios.post('/api/v1/rest-auth/logout/', {}, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const loggingOut = () => (dispatch, getState) => {
  dispatch(setLoggingOut(true))
  return postLogout(getState().user.token)
    .then(res => {
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

export const setLoadingUserStats = val => {
  return {
    type: SET_LOADING_USER_STATS,
    val
  }
}

export const setUserStats = val => {
  return {
    type: SET_USER_STATS,
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

export const setUpdatingUserEmail = val => ({
  type: SET_UPDATING_USER_EMAIL,
  val
})

const patchEmail = (token, email) =>
  axios.patch('/api/v1/rest-auth/user/', { email }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

const emailExists = err =>
  err.response.data.email != null &&
    err.response.data.email[0].includes('email already exists')

const second = 1000

export const updatingEmail = email => (dispatch, getState) => {
  dispatch(setUpdatingUserEmail(true))
  return patchEmail(getState().user.token, email)
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
      const messageExtra = emailExists(err)
        ? '- email already in use'
        : ''
      dispatch(setNotification({
        message: `problem updating email ${messageExtra}`,
        level: 'danger'
      }))
    })
}

const getUser = token =>
  // empty body since post expects the second argument to be the body
  axios.get('/api/v1/rest-auth/user/', {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

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

const getSocialConnections = token =>
  axios.get('/api/v1/rest-auth/socialaccounts/', {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const setSocialConnections = val => {
  return {
    type: SET_SOCIAL_ACCOUNT_CONNECTIONS,
    val
  }
}

export const setSocialConnection = (provider, val) => ({
  type: SET_SOCIAL_ACCOUNT_CONNECTION,
  provider,
  val,
})

export const fetchSocialConnections = () => (dispatch, getState) => {
  getSocialConnections(getState().user.token)
    .then(res => {
      dispatch(setSocialConnections(res.data))
    })
}

const removeSocialAccount = (token, id) =>
  axios.post(`/api/v1/rest-auth/socialaccounts/${id}/disconnect/`, {id}, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const disconnectSocialAccount = (provider, id) => (dispatch, getState) => {
  removeSocialAccount(getState().user.token, id)
    .then(res => {
      dispatch(setSocialConnections(
        [
          {
            provider: provider,
            id: null
          }
        ]
      ))
    })
}

const getUserStats = token =>
  axios.get('api/v1/user_stats/', {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const fetchUserStats = () => (dispatch, getState) => {
  dispatch(setLoadingUserStats(true))
  getUserStats(getState().user.token)
    .then(res => {
      dispatch(setUserStats(res.data))
      dispatch(setLoadingUserStats(false))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      // TODO: handle error
      dispatch(setLoadingUserStats(false))
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
  dispatch(setErrorPasswordUpdate({}))
  postPasswordChange(getState().user.token, password1, password2, oldPassword)
    .then(res => {
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

export const setClearingCart = val => ({
  type: SET_CLEARING_CART,
  val
})

export const setShoppingList = val => {
  return {
    type: SET_SHOPPING_LIST,
    val
  }
}

export const setShoppingListEmpty = () =>
  setShoppingList([])

const postClearCart = token =>
  axios.post('/api/v1/clear_cart/', {}, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const clearRecipeCartAmounts = () => ({
  type: CLEAR_RECIPE_CART_AMOUNTS
})

export const clearCart = () => (dispatch, getState) => {
  dispatch(setClearingCart(true))
  postClearCart(getState().user.token)
    .then(res => {
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

const patchCart = (token, id, count) =>
  axios.patch(`/api/v1/cart/${id}/`, { count }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const setRecipeAddingToCart = (id, loading) => {
  return {
    type: SET_RECIPE_ADDING_TO_CART,
    id,
    loading
  }
}

export const addingToCart = id => (dispatch, getState) => {
  // we increment the cart value by 1, since we know the default / min cart
  // value is ensured to be 0 via the backend
  const count = getState().recipes[id].cart_count + 1
  dispatch(setRecipeAddingToCart(id, true))
  return patchCart(getState().user.token, id, count)
    .then(res => {
      const { recipe, count } = res.data
      dispatch(setRecipeCartAmount(recipe, count))
      dispatch(setRecipeAddingToCart(id, false))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      dispatch(setRecipeAddingToCart(id, false))
    })
}

export const updatingCart = (id, count) => (dispatch, getState) =>
  patchCart(getState().user.token, id, count)
    .then(res => {
      const { recipe, count } = res.data
      dispatch(setRecipeCartAmount(recipe, count))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
    })

export const setRecipeRemovingFromCart = (id, loading) => {
  return {
    type: SET_RECIPE_REMOVING_FROM_CART,
    id,
    loading
  }
}

export const removingFromCart = id => (dispatch, getState) => {
  const currentCount = getState().recipes[id].cart_count
  const count = currentCount > 0 ? currentCount - 1 : 0
  dispatch(setRecipeRemovingFromCart(id, true))
  return patchCart(getState().user.token, id, count)
    .then(res => {
      const { recipe, count } = res.data
      dispatch(setRecipeCartAmount(recipe, count))
      dispatch(setRecipeRemovingFromCart(id, false))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
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

export const setShoppingListError = val => ({
  type: SET_SHOPPING_LIST_ERROR,
  val
})

const getShoppingList = token =>
  axios.get('/api/v1/shoppinglist/', {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const fetchShoppingList = () => (dispatch, getState) => {
  dispatch(setLoadingShoppingList(true))
  dispatch(setShoppingListError(false))
  return getShoppingList(getState().user.token)
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
  dispatch(setErrorAddRecipe({}))
  return sendPostNewRecipe(getState().user.token, recipe)
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

const getRecipe = (token, id) =>
  axios.get(`/api/v1/recipes/${id}/`, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const fetchRecipe = id => (dispatch, getState) => {
  dispatch(setRecipe404(id, false))
  dispatch(setLoadingRecipe(id, true))
  return getRecipe(getState().user.token, id)
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
      console.log('error fetching recipe', err)
    })
}

const getRecipeList = token =>
  axios.get('/api/v1/recipes/', {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

const getRecentRecipes = token =>
  axios.get('/api/v1/recipes/?recent', {
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

export const fetchRecentRecipes = () => (dispatch, getState) => {
  dispatch(setLoadingRecipes(true))
  dispatch(setErrorRecipes(false))
  getRecentRecipes(getState().user.token)
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

export const fetchRecipeList = () => (dispatch, getState) => {
  dispatch(setLoadingRecipes(true))
  dispatch(setErrorRecipes(false))
  getRecipeList(getState().user.token)
    .then(res => {
      dispatch(setRecipes(res.data))
      dispatch(setLoadingRecipes(false))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
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

export const setAddingIngredientToRecipe = (id, val) => ({
  type: SET_ADDING_INGREDIENT_TO_RECIPE,
  id,
  val
})

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
export const addingRecipeIngredient = (recipeID, ingredient) => (dispatch, getState) => {
  dispatch(setAddingIngredientToRecipe(recipeID, true))
  return postRecipeIngredient(getState().user.token, recipeID, ingredient)
    .then(res => {
      dispatch(addIngredientToRecipe(recipeID, res.data))
      dispatch(setAddingIngredientToRecipe(recipeID, false))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      console.log('error adding recipe ingredient', err)
      dispatch(setAddingIngredientToRecipe(recipeID, false))
    })
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
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
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
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
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
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      console.log('error updating recipe time', err)
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

const patchRecipe = (token, id, data) =>
  axios.patch(`/api/v1/recipes/${id}/`, data, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const updateRecipe = (id, data) => (dispatch, getState) => {
  dispatch(setRecipeUpdating(id, true))
  return patchRecipe(getState().user.token, id, data)
    .then(res => {
      dispatch(setRecipe(res.data.id, res.data))
      dispatch(setRecipeUpdating(id, false))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      dispatch(setRecipeUpdating(id, false))
      console.log('error updating recipe ', err)
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
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      console.log('error adding recipe step', err)
      dispatch(setLoadingAddStepToRecipe(recipeID, false))
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

export const updatingIngredient = (recipeID, ingredientID, content) => (dispatch, getState) => {
  dispatch(setUpdatingIngredient(recipeID, ingredientID, true))
  return sendUpdateIngredient(getState().user.token, recipeID, ingredientID, content)
    .then(res => {
      dispatch(updateIngredient(recipeID, ingredientID, res.data))
      dispatch(setUpdatingIngredient(recipeID, ingredientID, false))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      dispatch(setUpdatingIngredient(recipeID, ingredientID, false))
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
  dispatch(setRemovingIngredient(recipeID, ingredientID, true))
  return sendDeleteIngredient(getState().user.token, recipeID, ingredientID)
    .then(() => {
      dispatch(setRemovingIngredient(recipeID, ingredientID, false))
      dispatch(deleteIngredient(recipeID, ingredientID))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      dispatch(setRemovingIngredient(recipeID, ingredientID, false))
      console.log('error deleting recipe ingredient', err)
    })
}

export const updateStep = (recipeID, stepID, text) => {
  return {
    type: UPDATE_STEP,
    recipeID,
    stepID,
    text
  }
}

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

const sendUpdateStep = (token, recipeID, stepID, text) =>
  axios.patch(`/api/v1/recipes/${recipeID}/steps/${stepID}/`, { text }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const updatingStep = (recipeID, stepID, text) => (dispatch, getState) => {
  dispatch(setUpdatingStep(recipeID, stepID, true))
  return sendUpdateStep(getState().user.token, recipeID, stepID, text)
    .then(res => {
      const text = res.data.text
      dispatch(updateStep(recipeID, stepID, text))
      dispatch(setUpdatingStep(recipeID, stepID, false))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      console.log('error updating recipe step', err)
      dispatch(setUpdatingStep(recipeID, stepID, false))
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
  dispatch(setRemovingStep(recipeID, stepID, true))
  return sendDeleteStep(getState().user.token, recipeID, stepID)
    .then(() => {
      dispatch(deleteStep(recipeID, stepID))
      dispatch(setRemovingStep(recipeID, stepID, false))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      console.log('error deleting recipe step', err)
      dispatch(setRemovingStep(recipeID, stepID, false))
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

export const logUserIn = (email, password) => dispatch => {
  dispatch(setLoadingLogin(true))
  dispatch(setErrorLogin({}))
  dispatch(clearNotification())
  return sendLoginInfo(email, password)
    .then(res => {
      dispatch(login(res.data.key, res.data.user))
      dispatch(setLoadingLogin(false))
      dispatch(push('/'))
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

export const setErrorSocialLogin = val => {
  return {
    type: SET_ERROR_SOCIAL_LOGIN,
    val
  }
}

const sendSocialLogin = (service, token) =>
  axios.post(`/api/v1/rest-auth/${service}/`, {
    'code': token
  })

export const socialLogin = (service, token) => (dispatch, getState) => {
  return sendSocialLogin(service, token)
    .then(res => {
      dispatch(login(res.data.key, res.data.user))
      dispatch(replace('/'))
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

const sendSocialConnect = (service, code, token) =>
  axios.post(`/api/v1/rest-auth/${service}/connect/`, {
    'code': code
  }, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const socialConnect = (service, code, token) => (dispatch, getState) => {
  return sendSocialConnect(service, code, getState().user.token)
    .then(res => {
      dispatch(replace('/settings'))
    })
    .catch(err => {
      dispatch(replace('/settings'))
      throw err
    })
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
      dispatch(login(res.data.key, res.data.user))
      dispatch(setLoadingSignup(false))
      dispatch(push('/recipes/add'))
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

export const setDeletingRecipe = (id, val) => ({
  type: SET_DELETING_RECIPE,
  id,
  val
})

export const deleteRecipe = id => ({
  type: DELETE_RECIPE,
  id
})

const sendDeleteRecipe = (token, id) =>
  axios.delete(`/api/v1/recipes/${id}/`, {
    headers: {
      'Authorization': 'Token ' + token
    }
  })

export const deletingRecipe = id => (dispatch, getState) => {
  dispatch(setDeletingRecipe(id, true))
  return sendDeleteRecipe(getState().user.token, id)
    .then(res => {
      dispatch(deleteRecipe(id))
      dispatch(setDeletingRecipe(id, false))
      dispatch(push('/recipes'))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      dispatch(setDeletingRecipe(id, false))
      console.warn('error deleting recipe', err)
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

export const setLoadingResetConfirmation = val => {
  return {
    type: SET_LOADING_RESET_CONFIRMATION,
    val
  }
}

export const setErrorResetConfirmation = val => {
  return {
    type: SET_ERROR_RESET_CONFIRMATION,
    val
  }
}

const sendResetConfirmation = (uid, token, newPassword1, newPassword2) =>
  axios.post('/api/v1/rest-auth/password/reset/confirm/', {
    'uid': uid,
    'token': token,
    'new_password1': newPassword1,
    'new_password2': newPassword2
  })

export const resetConfirmation = (uid, token, newPassword1, newPassword2) => dispatch => {
  dispatch(setLoadingResetConfirmation(true))
  dispatch(setErrorResetConfirmation({}))
  dispatch(clearNotification())
  return sendResetConfirmation(uid, token, newPassword1, newPassword2)
    .then(res => {
      dispatch(setLoadingResetConfirmation(false))
      const message = res && res.data && res.data.detail
      dispatch(showNotificationWithTimeout({ message, level: 'success' }))
      dispatch(push('/login'))
    })
    .catch(err => {
      dispatch(setLoadingResetConfirmation(false))
      dispatch(showNotificationWithTimeout({
        message: 'uh oh! problem resetting password',
        level: 'danger',
        sticky: true
      }))
      console.warn('error with password reset', err)
      const badRequest = err.response.status === 400
      if (err.response && badRequest) {
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
