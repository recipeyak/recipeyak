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
  Invite,
  SetInvites,
  SetDecliningInvite,
  SetAcceptingInvite,
  SetLoadingInvites,
  SetAcceptedInvite,
  SetDeclinedInvite,
} from './reducers/invites'

import {
  ErrorPasswordUpdate
} from './reducers/passwordChange'

import {
  SetMovingTeam,
  SetCopyingTeam,
  SetLoadingTeams,
  DeleteTeam,
  SetDeletingMembership,
  DeleteMembership,
  TeamLevel,
  Team,
  TeamOptional,
  Member,
} from './reducers/teams'

import {
  Ingredient,
  Step,
  Recipe,
} from './reducers/recipes'

import {
  ErrorLogin,
  ErrorSignup,
  ErrorReset,
  ErrorAddRecipe,
  ErrorSocialLogin,
} from './reducers/error'

import {
  ShoppingListItem,
  SetShoppingList,
} from './reducers/shoppinglist'

import {
  User,
  UserStats,
} from './reducers/user'

import {
  Provider,
  SetSocialAccountConnections,
} from './reducers/socialAccounts'

import {
  push,
  replace
} from 'react-router-redux'

import { Dispatch } from 'redux';

import axios, { AxiosResponse, AxiosError } from 'axios'
import raven from 'raven-js'

import { store, StateTree } from './store'

const config = { timeout: 15000 }

const http = axios.create(config)
const anon = axios.create(config)

const handleResponseError = (error: AxiosError) => {
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

const invalidToken = (res: AxiosResponse) =>
  res != null && res.data.detail === 'Invalid token.' && res.status === 401

const badRequest = (err: AxiosError) => err.response && err.response.status === 400

const is404 = (err: AxiosError) => err.response.status === 404

interface GetState {
  (): StateTree
}

type NotificationLevel = 'info'
  | 'danger'
  | 'success'

interface Notification {
  message: string
  closeable?: boolean
  level: NotificationLevel
  delay?: number
  sticky?: boolean
}

export const setNotification = ({
  message,
  closeable = true,
  level
}: Notification) => ({
  type: SET_NOTIFICATION,
  message,
  closeable,
  level
})

export const clearNotification = () => ({
  type: CLEAR_NOTIFICATION
})

type Timer = NodeJS.Timer
// https://stackoverflow.com/a/38574266/3555105
let notificationTimeout: Timer = null
export const showNotificationWithTimeout = ({
  message,
  level,
  closeable = true,
  delay = 2000,
  sticky = false
}: Notification) => (dispatch: Dispatch<StateTree>) => {
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

export const login = (token: string, user: User) => ({
  type: LOG_IN,
  token,
  user
})

export const logout = () => ({
  type: LOG_OUT
})

export const setLoggingOut = (val: boolean) => ({
  type: SET_LOGGING_OUT,
  val
})

export const loggingOut = () => (dispatch: Dispatch<StateTree>) => {
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

export const setLoadingUser = (val: boolean) => ({
  type: SET_LOADING_USER,
  val
})

export const setErrorUser = (val: boolean) => ({
  type: SET_ERROR_USER,
  val
})

export const setLoadingUserStats = (val: boolean) => ({
  type: SET_LOADING_USER_STATS,
  val
})

export const setUserStats = (val: UserStats) => ({
  type: SET_USER_STATS,
  val
})

export const setAvatarURL = (url: string) => ({
  type: SET_AVATAR_URL,
  url
})

export const setUserEmail = (email: string) => ({
  type: SET_USER_EMAIL,
  email
})

export const setPasswordUsable = (val: boolean) => ({
  type: SET_PASSWORD_USABLE,
  val
})

export const setUpdatingUserEmail = (val: boolean) => ({
  type: SET_UPDATING_USER_EMAIL,
  val
})

export const setFromUrl = (val: string) => ({
  type: SET_FROM_URL,
  val
})

const emailExists = (err: AxiosError) =>
  err.response.data.email != null &&
  err.response.data.email[0].includes('email already exists')

const second = 1000

export const updatingEmail = (email: string) => (dispatch: Dispatch<StateTree>) => {
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

export const setUserID = (id: number) => ({
  type: SET_USER_ID,
  id,
})

export const fetchUser = () => (dispatch: Dispatch<StateTree>) => {
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

export const setSocialConnections = (val: Provider[]): SetSocialAccountConnections => ({
  type: SET_SOCIAL_ACCOUNT_CONNECTIONS,
  val
})

export const fetchSocialConnections = () => (dispatch: Dispatch<StateTree>) => {
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

export const disconnectSocialAccount = (provider: string, id: number) => (dispatch: Dispatch<StateTree>) => {
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

export const fetchUserStats = () => (dispatch: Dispatch<StateTree>) => {
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

export const setLoadingPasswordUpdate = (val: boolean) => ({
  type: SET_LOADING_PASSWORD_UPDATE,
  val
})

export const setErrorPasswordUpdate = (val: ErrorPasswordUpdate | {}) => ({
  type: SET_ERROR_PASSWORD_UPDATE,
  val
})

export const updatingPassword = (password1: string, password2: string, oldPassword: string) => (dispatch: Dispatch<StateTree>) => {
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

export const setLoadingCart = (val: boolean) => ({
  type: SET_LOADING_CART,
  val
})

export const setClearingCart = (val: boolean) => ({
  type: SET_CLEARING_CART,
  val
})

export const setShoppingList = (val: ShoppingListItem[]): SetShoppingList => ({
  type: SET_SHOPPING_LIST,
  val
})

export const setShoppingListEmpty = () =>
  setShoppingList([])

export const clearRecipeCartAmounts = () => ({
  type: CLEAR_RECIPE_CART_AMOUNTS
})

export const clearCart = () => (dispatch: Dispatch<StateTree>) => {
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

export const setRecipeCartAmount = (id: number, count: number) => ({
  type: SET_RECIPE_CART_AMOUNT,
  id,
  count
})

export const setRecipeAddingToCart = (id: number, loading: boolean) => ({
  type: SET_RECIPE_ADDING_TO_CART,
  id,
  loading
})

export const addingToCart = (id: number) => (dispatch: Dispatch<StateTree>, getState: GetState) => {
  // we increment the cart value by 1, since we know the default / min cart
  // value is ensured to be 0 via the backend
  const count = getState().recipes[id].cart_count + 1
  dispatch(setRecipeAddingToCart(id, true))
  return updatingCart(id, count)(dispatch)
  .then(() => {
    dispatch(setRecipeAddingToCart(id, false))
  })
  .catch(err => {
    dispatch(setRecipeAddingToCart(id, false))
    throw err
  })
}

export const updatingCart = (id: number, count: number) => (dispatch: Dispatch<StateTree>) =>
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

export const setRecipeRemovingFromCart = (id: number, loading: boolean) => ({
  type: SET_RECIPE_REMOVING_FROM_CART,
  id,
  loading
})

export const removingFromCart = (id: number) => (dispatch: Dispatch<StateTree>, getState: GetState) => {
  const currentCount = getState().recipes[id].cart_count
  const count = currentCount > 0 ? currentCount - 1 : 0
  dispatch(setRecipeRemovingFromCart(id, true))
  return updatingCart(id, count)(dispatch)
  .then(() => {
    dispatch(setRecipeRemovingFromCart(id, false))
  })
  .catch(err => {
    dispatch(setRecipeRemovingFromCart(id, false))
    throw err
  })
}

export const setLoadingShoppingList = (val: boolean) => ({
  type: SET_LOADING_SHOPPING_LIST,
  val
})

export const setShoppingListError = (val: boolean) => ({
  type: SET_SHOPPING_LIST_ERROR,
  val
})

export const fetchShoppingList = () => (dispatch: Dispatch<StateTree>) => {
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

export const addRecipe = (recipe: Recipe) => ({
  type: ADD_RECIPE,
  recipe
})

export const setLoadingAddRecipe = (val: boolean) => ({
  type: SET_LOADING_ADD_RECIPE,
  val
})

export const setErrorAddRecipe = (val: ErrorAddRecipe | {}) => ({
  type: SET_ERROR_ADD_RECIPE,
  val
})

export const postNewRecipe = (recipe: Recipe) => (dispatch: Dispatch<StateTree>) => {
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

export const setRecipe404 = (id: number, val: boolean) => ({
  type: SET_RECIPE_404,
  id,
  val
})

export const setLoadingRecipe = (id: number, val: boolean) => ({
  type: SET_LOADING_RECIPE,
  id,
  val
})

export const fetchRecipe = (id: number) => (dispatch: Dispatch<StateTree>) => {
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

export const setRecipes = (recipes: Recipe[]) => ({
  type: SET_RECIPES,
  recipes
})

export const setErrorRecipes = (val: boolean) => ({
  type: SET_ERROR_RECIPES,
  val
})

export const setLoadingRecipes = (val: boolean) => ({
  type: SET_LOADING_RECIPES,
  val
})

export const fetchRecentRecipes = () => (dispatch: Dispatch<StateTree>) => {
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

export const fetchRecipeList = () => (dispatch: Dispatch<StateTree>) => {
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

export const setLoadingAddStepToRecipe = (id: number, val: boolean) => ({
  type: SET_LOADING_ADD_STEP_TO_RECIPE,
  id,
  val
})

export const addStepToRecipe = (id: number, step: Step) => ({
  type: ADD_STEP_TO_RECIPE,
  id,
  step
})

export const setAddingIngredientToRecipe = (id: number, val: boolean) => ({
  type: SET_ADDING_INGREDIENT_TO_RECIPE,
  id,
  val
})

export const addIngredientToRecipe = (id: number, ingredient: Ingredient) => ({
  type: ADD_INGREDIENT_TO_RECIPE,
  id,
  ingredient
})

export const addingRecipeIngredient = (recipeID: number, ingredient: Ingredient) => (dispatch: Dispatch<StateTree>) => {
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

export const updateRecipeName = (id: number, name: string) => ({
  type: UPDATE_RECIPE_NAME,
  id,
  name
})

export const sendUpdatedRecipeName = (id: number, name: string) => (dispatch: Dispatch<StateTree>) => {
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

export const updateRecipeSource = (id: number, source: string) => ({
  type: UPDATE_RECIPE_SOURCE,
  id,
  source
})

export const setRecipeSource = (id: number, source: string) => (dispatch: Dispatch<StateTree>) => {
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

export const updateRecipeAuthor = (id: number, author: string) => ({
  type: UPDATE_RECIPE_AUTHOR,
  id,
  author
})

export const setRecipeAuthor = (id: number, author: string) => (dispatch: Dispatch<StateTree>) => {
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

export const updateRecipeTime = (id: number, time: string) => ({
  type: UPDATE_RECIPE_TIME,
  id,
  time
})

export const setRecipeTime = (id: number, time: string) => (dispatch: Dispatch<StateTree>) => {
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

export const setRecipe = (id: number, data: Recipe) => ({
  type: SET_RECIPE,
  id,
  data
})

export const setRecipeUpdating = (id: number, val: boolean) => ({
  type: SET_RECIPE_UPDATING,
  id,
  val
})

export const updateRecipe = (id: number, data: Recipe) => (dispatch: Dispatch<StateTree>) => {
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

export const updateIngredient = (recipeID: number, ingredientID: number, content: Ingredient) => ({
  type: UPDATE_INGREDIENT,
  recipeID,
  ingredientID,
  content
})

export const addingRecipeStep = (recipeID: number, step: string) => (dispatch: Dispatch<StateTree>) => {
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

export const setRemovingIngredient = (recipeID: number, ingredientID: number, val: boolean) => ({
  type: SET_REMOVING_INGREDIENT,
  recipeID,
  ingredientID,
  val
})

export const setUpdatingIngredient = (recipeID: number, ingredientID: number, val: boolean) => ({
  type: SET_UPDATING_INGREDIENT,
  recipeID,
  ingredientID,
  val
})

export const updatingIngredient = (recipeID: number, ingredientID: number, content: Ingredient) => (dispatch: Dispatch<StateTree>) => {
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

export const deleteIngredient = (recipeID: number, ingredientID: number) => ({
  type: DELETE_INGREDIENT,
  recipeID,
  ingredientID
})

export const deletingIngredient = (recipeID: number, ingredientID: number) => (dispatch: Dispatch<StateTree>) => {
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

export const updateStep = (recipeID: number, stepID: number, text: string) => ({
  type: UPDATE_STEP,
  recipeID,
  stepID,
  text
})

export const setRemovingStep = (recipeID: number, stepID: number, val: boolean) => ({
  type: SET_REMOVING_STEP,
  recipeID,
  stepID,
  val
})

export const setUpdatingStep = (recipeID: number, stepID: number, val: boolean) => ({
  type: SET_UPDATING_STEP,
  recipeID,
  stepID,
  val
})

export const updatingStep = (recipeID: number, stepID: number, text: string) => (dispatch: Dispatch<StateTree>) => {
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

export const deleteStep = (recipeID: number, stepID: number) => ({
  type: DELETE_STEP,
  recipeID,
  stepID
})

export const deletingStep = (recipeID: number, stepID: number) => (dispatch: Dispatch<StateTree>) => {
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

export const setErrorLogin = (val: ErrorLogin | {}) => ({
  type: SET_ERROR_LOGIN,
  val
})

export const setLoadingLogin = (val: boolean) => ({
  type: SET_LOADING_LOGIN,
  val
})

export const logUserIn = (email: string, password: string, redirectUrl = '') => (dispatch: Dispatch<StateTree>) => {
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

export const setErrorSocialLogin = (val: ErrorSocialLogin) => ({
  type: SET_ERROR_SOCIAL_LOGIN,
  val
})

export const socialLogin = (service: string, token: string, redirectUrl = '') => (dispatch: Dispatch<StateTree>) => {
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

export const socialConnect = (service: string, code: string) => (dispatch: Dispatch<StateTree>) => {
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

export const setLoadingSignup = (val: boolean) => ({
  type: SET_LOADING_SIGNUP,
  val
})

export const setErrorSignup = (val: ErrorSignup | {}) => ({
  type: SET_ERROR_SIGNUP,
  val
})

export const signup = (email: string, password1: string, password2: string) => (dispatch: Dispatch<StateTree>) => {
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

export const setDeletingRecipe = (id: number, val: boolean) => ({
  type: SET_DELETING_RECIPE,
  id,
  val
})

export const deleteRecipe = (id: number) => ({
  type: DELETE_RECIPE,
  id
})

export const deletingRecipe = (id: number) => (dispatch: Dispatch<StateTree>) => {
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

export const setLoadingReset = (val: boolean) => ({
  type: SET_LOADING_RESET,
  val
})

export const setErrorReset = (val: ErrorReset | {}) => ({
  type: SET_ERROR_RESET,
  val
})

export const reset = (email: string) => (dispatch: Dispatch<StateTree>) => {
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

export const setLoadingResetConfirmation = (val: boolean) => ({
  type: SET_LOADING_RESET_CONFIRMATION,
  val
})

export const resetConfirmation = (uid: string, token: string, newPassword1: string, newPassword2: string) => (dispatch: Dispatch<StateTree>) => {
  dispatch(setLoadingResetConfirmation(true))
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

      const tokenData = data['token'] && data['token'].map((x: string) => 'token: ' + x)
      const uidData = data['uid'] && data['uid'].map((x: string) => 'uid: ' + x)
      const nonFieldErrors = [].concat(data['non_field_errors']).concat(tokenData).concat(uidData)

      dispatch(setErrorReset({
        newPassword1: data['new_password1'],
        newPassword2: data['new_password2'],
        nonFieldErrors
      }))
    }
  })
}

export const setAddRecipeFormName = (val: string) => ({
  type: SET_ADD_RECIPE_FORM_NAME,
  val
})

export const setAddRecipeFormAuthor = (val: string) => ({
  type: SET_ADD_RECIPE_FORM_AUTHOR,
  val
})

export const setAddRecipeFormSource = (val: string) => ({
  type: SET_ADD_RECIPE_FORM_SOURCE,
  val
})

export const setAddRecipeFormTime = (val: string) => ({
  type: SET_ADD_RECIPE_FORM_TIME,
  val
})

export const setAddRecipeFormServings = (val: string) => ({
  type: SET_ADD_RECIPE_FORM_SERVINGS,
  val
})

export const setAddRecipeFormTeam = (val: string) => ({
  type: SET_ADD_RECIPE_FORM_TEAM,
  val,
})

export const addAddRecipeFormIngredient = (ingredient: Ingredient) => ({
  type: ADD_ADD_RECIPE_FORM_INGREDIENT,
  ingredient
})

export const removeAddRecipeFormIngredient = (index: number) => ({
  type: REMOVE_ADD_RECIPE_FORM_INGREDIENT,
  index
})

export const addAddRecipeFormStep = (step: { text: string }) => ({
  type: ADD_ADD_RECIPE_FORM_STEP,
  step
})

export const removeAddRecipeFormStep = (index: number) => ({
  type: REMOVE_ADD_RECIPE_FORM_STEP,
  index
})

export const updateAddRecipeFormIngredient = (index: number, ingredient: Ingredient) => ({
  type: UPDATE_ADD_RECIPE_FORM_INGREDIENT,
  index,
  ingredient
})

export const updateAddRecipeFormStep = (index: number, step: Step) => ({
  type: UPDATE_ADD_RECIPE_FORM_STEP,
  index,
  step
})

export const clearAddRecipeForm = () => ({
  type: CLEAR_ADD_RECIPE_FORM
})

export const addTeam = (team: Team) => ({
  type: ADD_TEAM,
  team
})

export const setLoadingTeam = (id: number, loadingTeam: boolean) => ({
  type: SET_LOADING_TEAM,
  id,
  loadingTeam,
})

export const setLoadingTeamMembers = (id: number, loadingMembers: boolean) => ({
  type: SET_LOADING_TEAM_MEMBERS,
  id,
  loadingMembers,
})

export const setTeam404 = (id: number, val = true) => ({
  type: SET_TEAM_404,
  id,
  val,
})

export const setTeamMembers = (id: number, members: Member[]) => ({
  type: SET_TEAM_MEMBERS,
  id,
  members,
})

export const setTeamRecipes = (id: number, recipes: Recipe[]) => ({
  type: SET_TEAM_RECIPES,
  id,
  recipes,
})

export const setLoadingTeamRecipes = (id: number, loadingRecipes: boolean) => ({
  type: SET_LOADING_TEAM_RECIPES,
  id,
  loadingRecipes,
})

export const fetchTeam = (id: number) => (dispatch: Dispatch<StateTree>) => {
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

export const fetchTeamMembers = (id: number) => (dispatch: Dispatch<StateTree>) => {
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

export const fetchTeamRecipes = (id: number) => (dispatch: Dispatch<StateTree>) => {
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

export const setUpdatingUserTeamLevel = (id: number, updating: boolean) => ({
  type: SET_UPDATING_USER_TEAM_LEVEL,
  id,
  updating,
})

// TOOD:  this is a specify level
export const setUserTeamLevel = (teamID: number, membershipID: number, level: TeamLevel) => ({
  type: SET_USER_TEAM_LEVEL,
  teamID,
  membershipID,
  level,
})

const attemptedDeleteLastAdmin = (res: AxiosResponse) =>
  res.status === 400 && res.data.level && res.data.level[0].includes('cannot demote')

export const settingUserTeamLevel = (teamID: number, membershipID: number, level: TeamLevel) => (dispatch: Dispatch<StateTree>) => {
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

export const deleteMembership = (teamID: number, membershipID: number): DeleteMembership => ({
  type: DELETE_MEMBERSHIP,
  teamID,
  membershipID
})

export const setDeletingMembership = (teamID: number, membershipID: number, val: boolean): SetDeletingMembership  => ({
  type: SET_DELETING_MEMBERSHIP,
  teamID,
  membershipID,
  val,
})

export const deleteTeam = (id: number): DeleteTeam => ({
  type: DELETE_TEAM,
  id,
})

export const deletingMembership = (teamID: number, id: number, leaving = false) => (dispatch: Dispatch<StateTree>, getState: GetState) => {
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

export const deletingTeam = (teamID: number) => (dispatch: Dispatch<StateTree>, getState: GetState) => {
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

export const setSendingTeamInvites = (teamID: number, val: boolean) => ({
  type: SET_SENDING_TEAM_INVITES,
  teamID,
  val,
})

export type TeamInviteLevels = 'admin' | 'contributor' | 'viewer'

export const sendingTeamInvites = (teamID: number, emails: string[], level: TeamInviteLevels) => (dispatch: Dispatch<StateTree>) => {
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

export const setLoadingTeams = (val: boolean): SetLoadingTeams => ({
  type: SET_LOADING_TEAMS,
  val,
})

export const setTeams = (teams: Team[]) => ({
  type: SET_TEAMS,
  teams,
})

export const fetchTeams = () => (dispatch: Dispatch<StateTree>) => {
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

export const setTeam = (id: number, team: Team) => ({
  type: SET_TEAM,
  id,
  team,
})

export const updateTeamById = (id: number, teamKeys: number[]) => ({
  type: UPDATE_TEAM,
  id,
  teamKeys,
})

export const setCreatingTeam = (val: boolean) => ({
  type: SET_CREATING_TEAM,
  val,
})

export const creatingTeam = (name: string, emails: string[], level: string) => (dispatch: Dispatch<StateTree>) => {
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

export const setMovingTeam = (val: boolean): SetMovingTeam => ({
  type: SET_MOVING_TEAM,
  val,
})

export const setCopyingTeam = (val: boolean): SetCopyingTeam => ({
  type: SET_COPYING_TEAM,
  val,
})

export const updatingTeam = (teamId: number, team: TeamOptional) => (dispatch: Dispatch<StateTree>) => {
  return http.patch(`/api/v1/t/${teamId}/`, team)
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

export const moveRecipeTo = (recipeId: number, ownerId: number, type: string) => (dispatch: Dispatch<StateTree>) => {
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

export const copyRecipeTo = (recipeId: number, ownerId: number, type: string) => (dispatch: Dispatch<StateTree>) => {
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

export const setLoadingInvites = (val: boolean): SetLoadingInvites => ({
  type: SET_LOADING_INVITES,
  val,
})

export const setInvites = (invites: Invite[]): SetInvites => ({
  type: SET_INVITES,
  invites,
})

// TODO: add to reducer
export const setErrorFetchingInvites = (val: boolean) => ({
  type: SET_ERROR_FETCHING_INVITES,
  val,
})

export const fetchInvites = () => (dispatch: Dispatch<StateTree>) => {
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

export const setAcceptingInvite = (id: number, val: boolean): SetAcceptingInvite => ({
  type: SET_ACCEPTING_INVITE,
  id,
  val,
})

export const setAcceptedInvite = (id: number): SetAcceptedInvite => ({
  type: SET_ACCEPTED_INVITE,
  id,
})

export const acceptingInvite = (id: number) => (dispatch: Dispatch<StateTree>) => {
  dispatch(setAcceptingInvite(id, true))
  return http.post(`/api/v1/invites/${id}/accept/`, {})
  .then(() => {
    dispatch(setAcceptingInvite(id, false))
    dispatch(setAcceptedInvite(id))
  })
  .catch(err => {
    dispatch(setAcceptingInvite(id, false))
    throw err
  })
}

export const setDecliningInvite = (id: number, val: boolean): SetDecliningInvite => ({
  type: SET_DECLINING_INVITE,
  id,
  val,
})

export const setDeclinedInvite = (id: number): SetDeclinedInvite => ({
  type: SET_DECLINED_INVITE,
  id,
})

export const decliningInvite = (id: number) => (dispatch: Dispatch<StateTree>) => {
  dispatch(setDecliningInvite(id, true))
  return http.post(`/api/v1/invites/${id}/decline/`, {})
  .then(() => {
    dispatch(setDecliningInvite(id, false))
    dispatch(setDeclinedInvite(id))
  })
  .catch(err => {
    dispatch(setDecliningInvite(id, false))
    throw err
  })
}
