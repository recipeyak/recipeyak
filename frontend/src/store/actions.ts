import isSameDay from "date-fns/is_same_day"

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
  SET_SHOPPING_LIST_ERROR,
  SET_SOCIAL_ACCOUNT_CONNECTIONS,
  SET_LOADING_RESET_CONFIRMATION,
  SET_ERROR_RESET_CONFIRMATION,
  TOGGLE_DARK_MODE,
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
  UPDATE_RECIPE_OWNER,
  SET_CALENDAR_RECIPES,
  SET_CALENDAR_RECIPE,
  DELETE_CALENDAR_RECIPE,
  SET_CALENDAR_ERROR,
  SET_CALENDAR_LOADING,
  SET_SCHEDULING_RECIPE,
  SET_SELECTING_START,
  SET_SELECTING_END,
  MOVE_CALENDAR_RECIPE,
  REPLACE_CALENDAR_RECIPE,
  SET_USER_LOGGED_IN,
  SET_SEARCH_RESULTS,
  CLEAR_SEARCH_RESULTS,
  INCR_LOADING_SEARCH,
  DECR_LOADING_SEARCH,
  SET_SCHEDULE_URL
} from "./actionTypes"

type TeamID = number | "personal"

// tslint:disable-next-line:ban-types
type Dispatch = Function
// tslint:disable-next-line:ban-types
type GetState = Function

import { uuid4 } from "../uuid"
import Cookie from "js-cookie"

import startOfMonth from "date-fns/start_of_month"
import subWeeks from "date-fns/sub_weeks"
import endOfMonth from "date-fns/end_of_month"
import addWeeks from "date-fns/add_weeks"

import { pyFormat } from "../date"

import { push, replace } from "react-router-redux"

import axios, { AxiosError, AxiosResponse, CancelTokenSource } from "axios"
import raven from "raven-js"

import { store } from "./store"
import { IUser, ISocialConnection, SocialProvider } from "./reducers/user"
import { IRecipe } from "./reducers/calendar"
import { IInvite } from "./reducers/invites"
import { INotificationState } from "./reducers/notification"

const config = { timeout: 15000 }

const http = axios.create(config)
const anon = axios.create(config)

const handleResponseError = (error: AxiosError) => {
  // 503 means we are in maintenance mode. Reload to show maintenance page.
  const maintenanceMode = error.response && error.response.status === 503
  // Report all 500 errors
  const serverError =
    !maintenanceMode && error.response && error.response.status >= 500
  // Report request timeouts
  const requestTimeout = error.code === "ECONNABORTED"
  const unAuthenticated = error.response && invalidToken(error.response)
  if (maintenanceMode) {
    location.reload()
  } else if (serverError || requestTimeout) {
    raven.captureException(error)
  } else if (unAuthenticated) {
    store.dispatch(setUserLoggedIn(false))
  }
  return Promise.reject(error)
}

http.interceptors.response.use(
  response => {
    store.dispatch(setUserLoggedIn(true))
    return response
  },
  error => handleResponseError(error)
)

anon.interceptors.response.use(
  response => response,
  error => handleResponseError(error)
)

http.interceptors.request.use(
  cfg => {
    const csrfToken = Cookie.get("csrftoken")
    cfg.headers["X-CSRFTOKEN"] = csrfToken
    return cfg
  },
  error => Promise.reject(error)
)

anon.interceptors.request.use(
  cfg => {
    const csrfToken = Cookie.get("csrftoken")
    cfg.headers["X-CSRFTOKEN"] = csrfToken
    return cfg
  },
  error => Promise.reject(error)
)

export { http, anon }

// We check if detail matches our string because Django will not return 401 when
// the session expires
export const invalidToken = (res: AxiosResponse) =>
  res != null &&
  res.data.detail === "Authentication credentials were not provided."

const isbadRequest = (err: AxiosError) =>
  err.response && err.response.status === 400

const is404 = (err: AxiosError) => err.response && err.response.status === 404

interface ISetNotification {
  readonly message: string
  readonly closeable?: boolean
  readonly level?: INotificationState["level"]
}

export const setNotification = ({
  message,
  closeable,
  level = "info"
}: ISetNotification) => ({
  type: SET_NOTIFICATION,
  notification: {
    message,
    closeable,
    level
  }
})

export const clearNotification = () => ({
  type: CLEAR_NOTIFICATION
})

interface INotificationWithTimeout {
  readonly delay?: number
  readonly sticky?: boolean
  readonly message: string
  readonly closeable?: boolean
  readonly level?: INotificationState["level"]
}

// https://stackoverflow.com/a/38574266/3555105
let notificationTimeout: NodeJS.Timer
export const showNotificationWithTimeout = ({
  message,
  level = "info",
  closeable = true,
  delay = 2000,
  sticky = false
}: INotificationWithTimeout) => (dispatch: Dispatch) => {
  clearTimeout(notificationTimeout)
  dispatch(
    setNotification({
      message,
      level,
      closeable
    })
  )

  if (!sticky) {
    notificationTimeout = setTimeout(() => {
      dispatch(clearNotification())
    }, delay)
  }
}

export const login = (user: IUser) => ({
  type: LOG_IN,
  user
})

export const logout = () => ({
  type: LOG_OUT
})

export const setLoggingOut = (val: boolean) => ({
  type: SET_LOGGING_OUT,
  val
})

export const loggingOut = () => (dispatch: Dispatch) => {
  dispatch(setLoggingOut(true))
  return http
    .post("/api/v1/rest-auth/logout/", {})
    .then(() => {
      dispatch(logout())
      dispatch(push("/login"))
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

export const setUserStats = (val: unknown) => ({
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
  err.response &&
  err.response.data.email != null &&
  err.response.data.email[0].includes("email already exists")

const second = 1000

export const updatingEmail = (email: string) => (dispatch: Dispatch) => {
  dispatch(setUpdatingUserEmail(true))
  return http
    .patch("/api/v1/rest-auth/user/", {
      email
    })
    .then(res => {
      dispatch(setUserEmail(res.data.email))
      dispatch(setAvatarURL(res.data.avatar_url))
      dispatch(setUpdatingUserEmail(false))
      dispatch(
        showNotificationWithTimeout({
          message: "updated email",
          level: "success",
          delay: 3 * second
        })
      )
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      dispatch(setUpdatingUserEmail(false))
      const messageExtra = emailExists(err) ? "- email already in use" : ""
      dispatch(
        setNotification({
          message: `problem updating email ${messageExtra}`,
          level: "danger"
        })
      )
    })
}

export const setUserID = (id: number) => ({
  type: SET_USER_ID,
  id
})

export const setUserLoggedIn = (val: boolean) => ({
  type: SET_USER_LOGGED_IN,
  val
})

export const fetchUser = () => (dispatch: Dispatch) => {
  dispatch(setLoadingUser(true))
  dispatch(setErrorUser(false))
  return http
    .get("/api/v1/rest-auth/user/")
    .then(res => {
      dispatch(setUserID(res.data.id))
      dispatch(setAvatarURL(res.data.avatar_url))
      dispatch(setUserEmail(res.data.email))
      dispatch(setPasswordUsable(res.data.has_usable_password))
      dispatch(setLoadingUser(false))
      dispatch(setUserLoggedIn(true))
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

export const setSocialConnections = (val: ISocialConnection[]) => ({
  type: SET_SOCIAL_ACCOUNT_CONNECTIONS,
  val
})

export const setSocialConnection = (
  provider: SocialProvider,
  val: unknown
) => ({
  type: SET_SOCIAL_ACCOUNT_CONNECTION,
  provider,
  val
})

export const fetchSocialConnections = () => (dispatch: Dispatch) => {
  return http
    .get("/api/v1/rest-auth/socialaccounts/")
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

export const disconnectSocialAccount = (
  provider: SocialProvider,
  id: number
) => (dispatch: Dispatch) => {
  return http
    .post(`/api/v1/rest-auth/socialaccounts/${id}/disconnect/`, {
      id
    })
    .then(() => {
      dispatch(
        setSocialConnections([
          {
            provider,
            id: null
          }
        ])
      )
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      throw err
    })
}

export const fetchUserStats = () => (dispatch: Dispatch) => {
  dispatch(setLoadingUserStats(true))
  return http
    .get("api/v1/user_stats/")
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

export const setErrorPasswordUpdate = (val: unknown) => ({
  type: SET_ERROR_PASSWORD_UPDATE,
  val
})

export const updatingPassword = (
  password1: string,
  password2: string,
  oldPassword: string
) => (dispatch: Dispatch) => {
  dispatch(setLoadingPasswordUpdate(true))
  dispatch(setErrorPasswordUpdate({}))
  return http
    .post("/api/v1/rest-auth/password/change/", {
      new_password1: password1,
      new_password2: password2,
      old_password: oldPassword
    })
    .then(() => {
      dispatch(setLoadingPasswordUpdate(false))
      dispatch(push("/"))
      dispatch(
        showNotificationWithTimeout({
          message: "Successfully updated password",
          level: "success"
        })
      )
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      dispatch(setLoadingPasswordUpdate(false))
      const badRequest = err.response.status === 400
      if (err.response && badRequest) {
        const data = err.response.data
        dispatch(
          setErrorPasswordUpdate({
            newPasswordAgain: data["new_password2"],
            newPassword: data["new_password1"],
            oldPassword: data["old_password"]
          })
        )
      }
      throw err
    })
}

export const setShoppingList = (val: unknown) => ({
  type: SET_SHOPPING_LIST,
  val
})

export const setShoppingListEmpty = () => setShoppingList([])

export const setLoadingShoppingList = (val: boolean) => ({
  type: SET_LOADING_SHOPPING_LIST,
  val
})

export const setShoppingListError = (val: unknown) => ({
  type: SET_SHOPPING_LIST_ERROR,
  val
})

export const fetchShoppingList = (teamID: TeamID) => (
  dispatch: Dispatch,
  getState: GetState
) => {
  const start = getState().shoppinglist.startDay
  const end = getState().shoppinglist.endDay
  dispatch(setLoadingShoppingList(true))
  dispatch(setShoppingListError(false))
  const url =
    teamID === "personal"
      ? "/api/v1/shoppinglist/"
      : `/api/v1/t/${teamID}/shoppinglist/`
  return http
    .get(url, {
      params: {
        start: pyFormat(start),
        end: pyFormat(end)
      }
    })
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

export const setSelectingStart = (date: Date) => ({
  type: SET_SELECTING_START,
  date
})

export const setSelectingEnd = (date: Date) => ({
  type: SET_SELECTING_END,
  date
})

export const addRecipe = (recipe: unknown) => ({
  type: ADD_RECIPE,
  recipe
})

export const setLoadingAddRecipe = (val: boolean) => ({
  type: SET_LOADING_ADD_RECIPE,
  val
})

export const setErrorAddRecipe = (val: unknown) => ({
  type: SET_ERROR_ADD_RECIPE,
  val
})

export const postNewRecipe = (recipe: unknown) => (dispatch: Dispatch) => {
  dispatch(setLoadingAddRecipe(true))
  dispatch(setErrorAddRecipe({}))

  return http
    .post("/api/v1/recipes/", recipe)
    .then(res => {
      dispatch(addRecipe(res.data))
      dispatch(clearAddRecipeForm())
      dispatch(setLoadingAddRecipe(false))
      dispatch(push("/recipes"))
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

      dispatch(
        showNotificationWithTimeout({
          message: "problem creating new recipe",
          level: "danger",
          delay: 5 * second
        })
      )
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

export const fetchRecipe = (id: number) => (dispatch: Dispatch) => {
  dispatch(setRecipe404(id, false))
  dispatch(setLoadingRecipe(id, true))
  return http
    .get(`/api/v1/recipes/${id}/`)
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

export const setRecipes = (recipes: unknown[]) => ({
  type: SET_RECIPES,
  recipes
})

export const setErrorRecipes = (val: unknown) => ({
  type: SET_ERROR_RECIPES,
  val
})

export const setLoadingRecipes = (val: boolean) => ({
  type: SET_LOADING_RECIPES,
  val
})

export const fetchRecentRecipes = () => (dispatch: Dispatch) => {
  dispatch(setLoadingRecipes(true))
  dispatch(setErrorRecipes(false))
  return http
    .get("/api/v1/recipes/?recent")
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

export const fetchRecipeList = (teamID: number | "personal") => (
  dispatch: Dispatch
) => {
  dispatch(setLoadingRecipes(true))
  dispatch(setErrorRecipes(false))

  const url =
    teamID === "personal" ? "/api/v1/recipes/" : `/api/v1/t/${teamID}/recipes/`

  return http
    .get(url)
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

export const setSearchResults = (results: unknown[]) => ({
  type: SET_SEARCH_RESULTS,
  results
})

export const clearSearchResults = () => ({
  type: CLEAR_SEARCH_RESULTS
})

export const incrLoadingSearch = () => {
  return {
    type: INCR_LOADING_SEARCH
  }
}

export const decrLoadingSearch = () => ({
  type: DECR_LOADING_SEARCH
})

interface ISearchStore {
  lastRequest: null | CancelTokenSource
}

// container for our promise cancel tokens
const searchStore: ISearchStore = {
  lastRequest: null
}

export const searchRecipes = (query: string) => (dispatch: Dispatch) => {
  // It's visually pleasing to have all the results disappear when
  // the search query is cleared.
  if (query === "") {
    return dispatch(clearSearchResults())
  }
  // count our request
  dispatch(incrLoadingSearch())
  // cancel unknown existing request
  if (searchStore.lastRequest != null) {
    searchStore.lastRequest.cancel()
  }
  // create and store cancel token
  const cancelSource = axios.CancelToken.source()
  searchStore.lastRequest = cancelSource
  // make request with cancel token
  return http
    .get(`/api/v1/recipes?q=${encodeURI(query)}`, {
      cancelToken: cancelSource.token
    })
    .then(res => {
      dispatch(decrLoadingSearch())
      dispatch(setSearchResults(res.data))
    })
    .catch(err => {
      dispatch(decrLoadingSearch())
      // Ignore axios cancels
      if (String(err) === "Cancel") {
        return err
      }
      raven.captureException(err)
      return err
    })
}

export const setLoadingAddStepToRecipe = (id: number, val: boolean) => ({
  type: SET_LOADING_ADD_STEP_TO_RECIPE,
  id,
  val
})

export const addStepToRecipe = (id: number, step: unknown) => ({
  type: ADD_STEP_TO_RECIPE,
  id,
  step
})

export const setAddingIngredientToRecipe = (id: number, val: unknown) => ({
  type: SET_ADDING_INGREDIENT_TO_RECIPE,
  id,
  val
})

export const addIngredientToRecipe = (id: number, ingredient: unknown) => ({
  type: ADD_INGREDIENT_TO_RECIPE,
  id,
  ingredient
})

export const addingRecipeIngredient = (
  recipeID: number,
  ingredient: unknown
) => (dispatch: Dispatch) => {
  dispatch(setAddingIngredientToRecipe(recipeID, true))
  return http
    .post(`/api/v1/recipes/${recipeID}/ingredients/`, ingredient)
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

export const sendUpdatedRecipeName = (id: number, name: string) => (
  dispatch: Dispatch
) => {
  return http
    .patch(`/api/v1/recipes/${id}/`, {
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

export const setRecipeSource = (id: number, source: string) => (
  dispatch: Dispatch
) => {
  return http
    .patch(`/api/v1/recipes/${id}/`, {
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

export const updateRecipeAuthor = (id: number, author: unknown) => ({
  type: UPDATE_RECIPE_AUTHOR,
  id,
  author
})

export const setRecipeAuthor = (id: number, author: unknown) => (
  dispatch: Dispatch
) => {
  return http
    .patch(`/api/v1/recipes/${id}/`, {
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

export const updateRecipeTime = (id: number, time: unknown) => ({
  type: UPDATE_RECIPE_TIME,
  id,
  time
})

export const setRecipeTime = (id: number, time: unknown) => (
  dispatch: Dispatch
) => {
  return http
    .patch(`/api/v1/recipes/${id}/`, {
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

export const setRecipe = (id: number, data: unknown) => ({
  type: SET_RECIPE,
  id,
  data
})

export const setRecipeUpdating = (id: number, val: unknown) => ({
  type: SET_RECIPE_UPDATING,
  id,
  val
})

export const updateRecipe = (id: number, data: unknown) => (
  dispatch: Dispatch
) => {
  dispatch(setRecipeUpdating(id, true))
  return http
    .patch(`/api/v1/recipes/${id}/`, data)
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

export const updateIngredient = (
  recipeID: number,
  ingredientID: number,
  content: unknown
) => ({
  type: UPDATE_INGREDIENT,
  recipeID,
  ingredientID,
  content
})

export const addingRecipeStep = (recipeID: number, step: unknown) => (
  dispatch: Dispatch
) => {
  dispatch(setLoadingAddStepToRecipe(recipeID, true))
  return http
    .post(`/api/v1/recipes/${recipeID}/steps/`, {
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

export const setRemovingIngredient = (
  recipeID: number,
  ingredientID: number,
  val: unknown
) => ({
  type: SET_REMOVING_INGREDIENT,
  recipeID,
  ingredientID,
  val
})

export const setUpdatingIngredient = (
  recipeID: number,
  ingredientID: number,
  val: unknown
) => ({
  type: SET_UPDATING_INGREDIENT,
  recipeID,
  ingredientID,
  val
})

export const updatingIngredient = (
  recipeID: number,
  ingredientID: number,
  content: unknown
) => (dispatch: Dispatch) => {
  dispatch(setUpdatingIngredient(recipeID, ingredientID, true))
  return http
    .patch(`/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`, content)
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

export const deletingIngredient = (recipeID: number, ingredientID: number) => (
  dispatch: Dispatch
) => {
  dispatch(setRemovingIngredient(recipeID, ingredientID, true))
  return http
    .delete(`/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`)
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

export const updateStep = (
  recipeID: number,
  stepID: number,
  text: string,
  position: number
) => ({
  type: UPDATE_STEP,
  recipeID,
  stepID,
  text,
  position
})

export const setRemovingStep = (
  recipeID: number,
  stepID: number,
  val: unknown
) => ({
  type: SET_REMOVING_STEP,
  recipeID,
  stepID,
  val
})

export const setUpdatingStep = (
  recipeID: number,
  stepID: number,
  val: unknown
) => ({
  type: SET_UPDATING_STEP,
  recipeID,
  stepID,
  val
})

export const updatingStep = (
  recipeID: number,
  stepID: number,
  { text, position }: { text: string; position: number }
) => (dispatch: Dispatch) => {
  dispatch(setUpdatingStep(recipeID, stepID, true))
  const data: { [key: string]: unknown } = {
    text,
    position
  }
  // Remove null/empty keys for PATCH
  for (const key of Object.keys(data)) {
    if (data[key] == null) {
      delete data[key]
    }
  }
  return http
    .patch(`/api/v1/recipes/${recipeID}/steps/${stepID}/`, data)
    .then(res => {
      const txt = res.data.text
      const pos = res.data.position
      dispatch(updateStep(recipeID, stepID, txt, pos))
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

export const deletingStep = (recipeID: number, stepID: number) => (
  dispatch: Dispatch
) => {
  dispatch(setRemovingStep(recipeID, stepID, true))
  return http
    .delete(`/api/v1/recipes/${recipeID}/steps/${stepID}/`)
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

export const setErrorLogin = (val: unknown) => ({
  type: SET_ERROR_LOGIN,
  val
})

export const setLoadingLogin = (val: boolean) => ({
  type: SET_LOADING_LOGIN,
  val
})

export const logUserIn = (
  email: string,
  password: string,
  redirectUrl: string = ""
) => (dispatch: Dispatch) => {
  dispatch(setLoadingLogin(true))
  dispatch(setErrorLogin({}))
  dispatch(clearNotification())
  return anon
    .post("/api/v1/rest-auth/login/", {
      email,
      password
    })
    .then(res => {
      dispatch(login(res.data.user))
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
        dispatch(
          setErrorLogin({
            email: data["email"],
            password1: data["password1"],
            nonFieldErrors: data["non_field_errors"]
          })
        )
      }
    })
}

export const setErrorSocialLogin = (val: unknown) => ({
  type: SET_ERROR_SOCIAL_LOGIN,
  val
})

export const socialLogin = (
  service: SocialProvider,
  token: string,
  redirectUrl: string = ""
) => (dispatch: Dispatch) => {
  return anon
    .post(`/api/v1/rest-auth/${service}/`, {
      code: token
    })
    .then(res => {
      dispatch(login(res.data.user))
      dispatch(replace(redirectUrl))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      const badRequest = err.response.status === 400
      if (err.response && badRequest) {
        const data = err.response.data
        dispatch(
          setErrorSocialLogin({
            emailSocial: data["email"],
            nonFieldErrorsSocial: data["non_field_errors"]
          })
        )
      }
      dispatch(replace("/login"))
      throw err
    })
}

export const socialConnect = (service: SocialProvider, code: unknown) => (
  dispatch: Dispatch
) => {
  return http
    .post(`/api/v1/rest-auth/${service}/connect/`, {
      code
    })
    .then(() => {
      dispatch(replace("/settings"))
    })
    .catch(err => {
      if (invalidToken(err.response)) {
        dispatch(logout())
      }
      dispatch(replace("/settings"))
      throw err
    })
}

export const setLoadingSignup = (val: boolean) => ({
  type: SET_LOADING_SIGNUP,
  val
})

export const setErrorSignup = (val: unknown) => ({
  type: SET_ERROR_SIGNUP,
  val
})

export const signup = (email: string, password1: string, password2: string) => (
  dispatch: Dispatch
) => {
  dispatch(setLoadingSignup(true))
  // clear previous signup errors
  dispatch(setErrorSignup({}))
  dispatch(clearNotification())
  return anon
    .post("/api/v1/rest-auth/registration/", {
      email,
      password1,
      password2
    })
    .then(res => {
      dispatch(login(res.data.user))
      dispatch(setLoadingSignup(false))
      dispatch(push("/recipes/add"))
    })
    .catch(err => {
      if (isbadRequest(err)) {
        const data = err.response.data
        dispatch(
          setErrorSignup({
            email: data["email"],
            password1: data["password1"],
            password2: data["password2"],
            nonFieldErrors: data["non_field_errors"]
          })
        )
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

export const deletingRecipe = (id: number) => (dispatch: Dispatch) => {
  dispatch(setDeletingRecipe(id, true))
  return http
    .delete(`/api/v1/recipes/${id}/`)
    .then(() => {
      dispatch(deleteRecipe(id))
      dispatch(setDeletingRecipe(id, false))
      dispatch(push("/recipes"))
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

export const setErrorReset = (val: unknown) => ({
  type: SET_ERROR_RESET,
  val
})

export const reset = (email: string) => (dispatch: Dispatch) => {
  dispatch(setLoadingReset(true))
  dispatch(setErrorReset({}))
  dispatch(clearNotification())
  return anon
    .post("/api/v1/rest-auth/password/reset/", {
      email
    })
    .then(res => {
      dispatch(setLoadingReset(false))
      const message = res && res.data && res.data.detail
      dispatch(
        showNotificationWithTimeout({
          message,
          level: "success"
        })
      )
    })
    .catch(err => {
      dispatch(setLoadingReset(false))
      dispatch(
        showNotificationWithTimeout({
          message: "uh oh! problem resetting password",
          level: "danger",
          sticky: true
        })
      )
      if (isbadRequest(err)) {
        const data = err.response.data
        dispatch(
          setErrorReset({
            email: data["email"],
            nonFieldErrors: data["non_field_errors"]
          })
        )
      }
      dispatch(
        showNotificationWithTimeout({
          message: "problem resetting password",
          level: "danger",
          sticky: true
        })
      )
    })
}

export const setLoadingResetConfirmation = (val: boolean) => ({
  type: SET_LOADING_RESET_CONFIRMATION,
  val
})

export const setErrorResetConfirmation = (val: unknown) => ({
  type: SET_ERROR_RESET_CONFIRMATION,
  val
})

export const resetConfirmation = (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string
) => (dispatch: Dispatch) => {
  dispatch(setLoadingResetConfirmation(true))
  dispatch(setErrorResetConfirmation({}))
  dispatch(clearNotification())
  return anon
    .post("/api/v1/rest-auth/password/reset/confirm/", {
      uid,
      token,
      new_password1: newPassword1,
      new_password2: newPassword2
    })
    .then(res => {
      dispatch(setLoadingResetConfirmation(false))
      const message = res && res.data && res.data.detail
      dispatch(
        showNotificationWithTimeout({
          message,
          level: "success"
        })
      )
      dispatch(push("/login"))
    })
    .catch(err => {
      dispatch(setLoadingResetConfirmation(false))
      dispatch(
        showNotificationWithTimeout({
          message: "uh oh! problem resetting password",
          level: "danger",
          sticky: true
        })
      )
      if (isbadRequest(err)) {
        const data = err.response.data

        const tokenData =
          data["token"] && data["token"].map((x: unknown) => "token: " + x)
        const uidData =
          data["uid"] && data["uid"].map((x: unknown) => "uid: " + x)
        const nonFieldErrors = []
          .concat(data["non_field_errors"])
          .concat(tokenData)
          .concat(uidData)

        dispatch(
          setErrorReset({
            newPassword1: data["new_password1"],
            newPassword2: data["new_password2"],
            nonFieldErrors
          })
        )
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
  val
})

export const addAddRecipeFormIngredient = (ingredient: unknown) => ({
  type: ADD_ADD_RECIPE_FORM_INGREDIENT,
  ingredient
})

export const removeAddRecipeFormIngredient = (index: number) => ({
  type: REMOVE_ADD_RECIPE_FORM_INGREDIENT,
  index
})

export const addAddRecipeFormStep = (step: unknown) => ({
  type: ADD_ADD_RECIPE_FORM_STEP,
  step
})

export const removeAddRecipeFormStep = (index: number) => ({
  type: REMOVE_ADD_RECIPE_FORM_STEP,
  index
})

export const updateAddRecipeFormIngredient = (
  index: number,
  ingredient: unknown
) => ({
  type: UPDATE_ADD_RECIPE_FORM_INGREDIENT,
  index,
  ingredient
})

export const updateAddRecipeFormStep = (index: number, step: unknown) => ({
  type: UPDATE_ADD_RECIPE_FORM_STEP,
  index,
  step
})

export const clearAddRecipeForm = () => ({
  type: CLEAR_ADD_RECIPE_FORM
})

export const addTeam = (team: unknown) => ({
  type: ADD_TEAM,
  team
})

export const setLoadingTeam = (id: number, loadingTeam: boolean) => ({
  type: SET_LOADING_TEAM,
  id,
  loadingTeam
})

export const setLoadingTeamMembers = (id: number, loadingMembers: boolean) => ({
  type: SET_LOADING_TEAM_MEMBERS,
  id,
  loadingMembers
})

export const setTeam404 = (id: number, val = true) => ({
  type: SET_TEAM_404,
  id,
  val
})

export const setTeamMembers = (id: number, members: unknown[]) => ({
  type: SET_TEAM_MEMBERS,
  id,
  members
})

export const setTeamRecipes = (id: number, recipes: unknown[]) => ({
  type: SET_TEAM_RECIPES,
  id,
  recipes
})

export const setLoadingTeamRecipes = (id: number, loadingRecipes: boolean) => ({
  type: SET_LOADING_TEAM_RECIPES,
  id,
  loadingRecipes
})

export const fetchTeam = (id: number) => (dispatch: Dispatch) => {
  dispatch(setLoadingTeam(id, true))
  return http
    .get(`/api/v1/t/${id}/`)
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

export const fetchTeamMembers = (id: number) => (dispatch: Dispatch) => {
  dispatch(setLoadingTeamMembers(id, true))
  return http
    .get(`/api/v1/t/${id}/members/`)
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

export const fetchTeamRecipes = (id: number) => (dispatch: Dispatch) => {
  dispatch(setLoadingTeamRecipes(id, true))
  return http
    .get(`/api/v1/t/${id}/recipes/`)
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
  updating
})

export const setUserTeamLevel = (
  teamID: number,
  membershipID: number,
  level: unknown
) => ({
  type: SET_USER_TEAM_LEVEL,
  teamID,
  membershipID,
  level
})

const attemptedDeleteLastAdmin = (res: AxiosResponse) =>
  res.status === 400 &&
  res.data.level &&
  res.data.level[0].includes("cannot demote")

export const settingUserTeamLevel = (
  teamID: number,
  membershipID: number,
  level: unknown
) => (dispatch: Dispatch) => {
  dispatch(setUpdatingUserTeamLevel(teamID, true))
  return http
    .patch(`/api/v1/t/${teamID}/members/${membershipID}/`, { level })
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
        dispatch(
          showNotificationWithTimeout({
            message,
            level: "danger",
            delay: 3 * second
          })
        )
      }
      dispatch(setUpdatingUserTeamLevel(teamID, false))
      throw err
    })
}

export const deleteMembership = (teamID: number, membershipID: number) => ({
  type: DELETE_MEMBERSHIP,
  teamID,
  membershipID
})

export const setDeletingMembership = (
  teamID: number,
  membershipID: number,
  val: unknown
) => ({
  type: SET_DELETING_MEMBERSHIP,
  teamID,
  membershipID,
  val
})

export const deleteTeam = (id: number) => ({
  type: DELETE_TEAM,
  id
})

export const deletingMembership = (
  teamID: number,
  id: number,
  leaving: boolean = false
) => (dispatch: Dispatch, getState: GetState) => {
  dispatch(setDeletingMembership(teamID, id, true))
  return http
    .delete(`/api/v1/t/${teamID}/members/${id}/`)
    .then(() => {
      const message = "left team " + getState().teams[teamID].name
      dispatch(deleteMembership(teamID, id))
      if (leaving) {
        dispatch(push("/"))
        dispatch(
          showNotificationWithTimeout({
            message,
            level: "success",
            delay: 3 * second
          })
        )
        dispatch(deleteTeam(teamID))
      }
    })
    .catch(err => {
      const message = err.response.data
      dispatch(
        showNotificationWithTimeout({
          message,
          level: "danger",
          delay: 3 * second
        })
      )
      dispatch(setDeletingMembership(teamID, id, false))
      throw err
    })
}

export const deletingTeam = (teamID: number) => (
  dispatch: Dispatch,
  getState: GetState
) => {
  return http
    .delete(`/api/v1/t/${teamID}`)
    .then(() => {
      dispatch(push("/"))
      const teamName = getState().teams[teamID].name
      dispatch(
        showNotificationWithTimeout({
          message: `Team deleted (${teamName})`,
          level: "success",
          delay: 3 * second
        })
      )
      dispatch(deleteTeam(teamID))
    })
    .catch(err => {
      let message = "Uh Oh! Something went wrong."
      if (err.response && err.response.status === 403) {
        message =
          err.response.data && err.response.data.detail
            ? err.response.data.detail
            : "You are not authorized to delete this team"
      } else if (err.response && err.response.status === 404) {
        message =
          err.response.data && err.response.data.detail
            ? err.response.data.detail
            : "The team you are attempting to delete doesn't exist"
      } else {
        raven.captureException(err)
      }
      dispatch(
        showNotificationWithTimeout({
          message,
          level: "danger",
          delay: 3 * second
        })
      )
      throw err
    })
}

export const setSendingTeamInvites = (teamID: number, val: unknown) => ({
  type: SET_SENDING_TEAM_INVITES,
  teamID,
  val
})

export const sendingTeamInvites = (
  teamID: number,
  emails: any[],
  level: unknown
) => (dispatch: Dispatch) => {
  dispatch(setSendingTeamInvites(teamID, true))
  return http
    .post(`/api/v1/t/${teamID}/invites/`, { emails, level })
    .then(() => {
      dispatch(
        showNotificationWithTimeout({
          message: "invites sent!",
          level: "success",
          delay: 3 * second
        })
      )
      dispatch(setSendingTeamInvites(teamID, false))
    })
    .catch(() => {
      dispatch(
        showNotificationWithTimeout({
          message: "error sending team invite",
          level: "danger",
          delay: 3 * second
        })
      )
      dispatch(setSendingTeamInvites(teamID, false))
    })
}

export const setLoadingTeams = (val: boolean) => ({
  type: SET_LOADING_TEAMS,
  val
})

export const setTeams = (teams: unknown) => ({
  type: SET_TEAMS,
  teams
})

export const fetchTeams = () => (dispatch: Dispatch) => {
  dispatch(setLoadingTeams(true))
  return http
    .get("/api/v1/t/")
    .then(res => {
      dispatch(setTeams(res.data))
      dispatch(setLoadingTeams(false))
    })
    .catch(err => {
      dispatch(setLoadingTeams(false))
      throw err
    })
}

export const setTeam = (id: number, team: unknown) => ({
  type: SET_TEAM,
  id,
  team
})

export const updateTeamById = (id: number, teamKeys: unknown) => ({
  type: UPDATE_TEAM,
  id,
  teamKeys
})

export const setCreatingTeam = (val: unknown) => ({
  type: SET_CREATING_TEAM,
  val
})

export const creatingTeam = (name: string, emails: string, level: unknown) => (
  dispatch: Dispatch
) => {
  dispatch(setCreatingTeam(true))
  return http
    .post("/api/v1/t/", { name, emails, level })
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

export const setCopyingTeam = (val: boolean) => ({
  type: SET_COPYING_TEAM,
  val
})

export const updatingTeam = (teamId: number, teamKVs: unknown) => (
  dispatch: Dispatch
) => {
  return http
    .patch(`/api/v1/t/${teamId}/`, teamKVs)
    .then(res => {
      dispatch(
        showNotificationWithTimeout({
          message: "Team updated",
          level: "success",
          delay: 3 * second
        })
      )
      dispatch(updateTeamById(res.data.id, res.data))
    })
    .catch(err => {
      let message = "Problem updating team."
      if (err.response && err.response.status === 403) {
        message = "You are not unauthorized to perform that action"
      }
      dispatch(
        showNotificationWithTimeout({
          message,
          level: "danger",
          delay: 3 * second
        })
      )
      throw err
    })
}

export const updateRecipeOwner = (id: number, owner: unknown) => ({
  type: UPDATE_RECIPE_OWNER,
  id,
  owner
})

export const moveRecipeTo = (
  recipeId: number,
  ownerId: number,
  type: unknown
) => (dispatch: Dispatch) => {
  return http
    .post(`/api/v1/recipes/${recipeId}/move/`, { id: ownerId, type })
    .then(res => {
      dispatch(updateRecipeOwner(res.data.id, res.data.owner))
    })
}

export const copyRecipeTo = (
  recipeId: number,
  ownerId: number,
  type: unknown
) => (dispatch: Dispatch) => {
  dispatch(setCopyingTeam(true))
  return http
    .post(`/api/v1/recipes/${recipeId}/copy/`, { id: ownerId, type })
    .then(res => {
      dispatch(addRecipe(res.data))
      dispatch(setCopyingTeam(false))
    })
    .catch(err => {
      dispatch(setCopyingTeam(false))
      throw err
    })
}

export const setLoadingInvites = (val: boolean) => ({
  type: SET_LOADING_INVITES,
  val
})

export const setInvites = (invites: IInvite[]) => ({
  type: SET_INVITES,
  invites
})

export const setErrorFetchingInvites = (val: unknown) => ({
  type: SET_ERROR_FETCHING_INVITES,
  val
})

export const fetchInvites = () => (dispatch: Dispatch) => {
  dispatch(setLoadingInvites(true))
  dispatch(setErrorFetchingInvites(false))
  return http
    .get("/api/v1/invites/")
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

export const setAcceptingInvite = (id: IInvite["id"], val: boolean) => ({
  type: SET_ACCEPTING_INVITE,
  id,
  val
})

export const setAcceptedInvite = (id: number) => ({
  type: SET_ACCEPTED_INVITE,
  id
})

export const acceptingInvite = (id: number) => (dispatch: Dispatch) => {
  dispatch(setAcceptingInvite(id, true))
  return http
    .post(`/api/v1/invites/${id}/accept/`, {})
    .then(() => {
      dispatch(setAcceptingInvite(id, false))
      dispatch(setAcceptedInvite(id))
    })
    .catch(err => {
      dispatch(setAcceptingInvite(id, false))
      throw err
    })
}

export const setDecliningInvite = (id: IInvite["id"], val: boolean) => ({
  type: SET_DECLINING_INVITE,
  id,
  val
})

export const setDeclinedInvite = (id: number) => ({
  type: SET_DECLINED_INVITE,
  id
})

export const decliningInvite = (id: number) => (dispatch: Dispatch) => {
  dispatch(setDecliningInvite(id, true))
  return http
    .post(`/api/v1/invites/${id}/decline/`, {})
    .then(() => {
      dispatch(setDecliningInvite(id, false))
      dispatch(setDeclinedInvite(id))
    })
    .catch(err => {
      dispatch(setDecliningInvite(id, false))
      throw err
    })
}

export const deleteUserAccount = () => (dispatch: Dispatch) => {
  return http
    .delete("/api/v1/rest-auth/user/")
    .then(() => {
      dispatch(logout())
      dispatch(push("/login"))
      dispatch(showNotificationWithTimeout({ message: "Account deleted" }))
    })
    .catch(error => {
      if (error.response.status === 403 && error.response.data.detail) {
        dispatch(
          showNotificationWithTimeout({
            message: error.response.data.detail,
            level: "danger"
          })
        )
      } else {
        dispatch(
          showNotificationWithTimeout({
            message: "failed to delete account",
            level: "danger"
          })
        )
        throw error
      }
    })
}

export const reportBadMerge = () => (dispatch: Dispatch) => {
  return http
    .post("/api/v1/report-bad-merge", {})
    .then(() => {
      dispatch(
        showNotificationWithTimeout({
          message: "reported bad merge",
          level: "success",
          delay: 3 * second
        })
      )
    })
    .catch(() => {
      dispatch(
        showNotificationWithTimeout({
          message: "error reporting bad merge",
          level: "danger",
          delay: 3 * second
        })
      )
    })
}

export const setCalendarLoading = (loading: boolean) => ({
  type: SET_CALENDAR_LOADING,
  loading
})

export const setCalendarError = (error: unknown) => ({
  type: SET_CALENDAR_ERROR,
  error
})

export const setCalendarRecipe = (recipe: IRecipe) => ({
  type: SET_CALENDAR_RECIPE,
  recipe
})

export const fetchCalendar = (teamID: TeamID, month = new Date()) => (
  dispatch: Dispatch
) => {
  dispatch(setCalendarLoading(true))
  dispatch(setCalendarError(false))
  const url =
    teamID === "personal"
      ? "/api/v1/calendar/"
      : `/api/v1/t/${teamID}/calendar/`
  // we fetch current month plus and minus 1 week
  return http
    .get(url, {
      params: {
        start: pyFormat(subWeeks(startOfMonth(month), 1)),
        end: pyFormat(addWeeks(endOfMonth(month), 1))
      }
    })
    .then(res => {
      dispatch(setCalendarRecipes(res.data))
      dispatch(setCalendarLoading(false))
    })
    .catch(() => {
      dispatch(setCalendarLoading(false))
      dispatch(setCalendarError(true))
    })
}

export const setSchedulingRecipe = (recipeID: number, scheduling: boolean) => ({
  type: SET_SCHEDULING_RECIPE,
  recipeID,
  scheduling
})

export const setCalendarRecipes = (recipes: IRecipe[]) => ({
  type: SET_CALENDAR_RECIPES,
  recipes
})

export const replaceCalendarRecipe = (id: IRecipe["id"], recipe: IRecipe) => ({
  type: REPLACE_CALENDAR_RECIPE,
  id,
  recipe
})

export const addingScheduledRecipe = (
  recipeID: number,
  teamID: TeamID,
  on: Date,
  count: number
) => (dispatch: Dispatch, getState: GetState) => {
  const recipe = getState().recipes[recipeID]
  dispatch(setSchedulingRecipe(recipeID, true))
  const id = uuid4()
  const data = {
    recipe: recipeID,
    on: pyFormat(on),
    count
  }
  // 1. preemptively add recipe
  // 2. if succeeded, then we replace the preemptively added one
  //    if failed, then we remove the preemptively added one, and display an error

  const url =
    teamID === "personal"
      ? "/api/v1/calendar/"
      : `/api/v1/t/${teamID}/calendar/`

  // HACK(sbdchd): we need to add the user to the recipe
  dispatch(setCalendarRecipe({ ...data, id, recipe } as IRecipe))
  return http
    .post(url, data)
    .then(res => {
      dispatch(replaceCalendarRecipe(id, res.data))
      dispatch(setSchedulingRecipe(recipeID, false))
    })
    .catch(() => {
      dispatch(deleteCalendarRecipe(id))
      dispatch(
        showNotificationWithTimeout({
          message: "error scheduling recipe",
          level: "danger",
          delay: 3 * second
        })
      )
      dispatch(setSchedulingRecipe(recipeID, false))
    })
}

export const deleteCalendarRecipe = (id: string | number) => ({
  type: DELETE_CALENDAR_RECIPE,
  id
})

export const moveCalendarRecipe = (id: number, to: string) => ({
  type: MOVE_CALENDAR_RECIPE,
  id,
  on: to
})

export const deletingScheduledRecipe = (id: number, teamID: TeamID) => (
  dispatch: Dispatch,
  getState: GetState
) => {
  const recipe = getState().calendar[id]
  dispatch(deleteCalendarRecipe(id))

  const url =
    teamID === "personal"
      ? `/api/v1/calendar/${id}/`
      : `/api/v1/t/${teamID}/calendar/${id}/`

  return http.delete(url).catch(() => {
    dispatch(setCalendarRecipe(recipe))
  })
}

export const moveScheduledRecipe = (id: number, teamID: TeamID, to: Date) => (
  dispatch: Dispatch,
  getState: GetState
) => {
  const from = getState().calendar[id]
  const existing = getState()
    .calendar.allIds.filter((x: unknown) => x !== id)
    .map((x: any) => getState().calendar[x])
    .filter((x: any) => isSameDay(x.on, to))
    .filter((x: any) => {
      if (teamID === "personal") {
        return x.user != null
      }
      return x.team === teamID
    })
    .find((x: any) => x.recipe.id === from.recipe.id)

  const sourceURL =
    teamID === "personal"
      ? `/api/v1/calendar/${id}/`
      : `/api/v1/t/${teamID}/calendar/${id}/`

  dispatch(moveCalendarRecipe(id, pyFormat(to)))

  if (existing) {
    const sinkURL =
      teamID === "personal"
        ? `/api/v1/calendar/${existing.id}/`
        : `/api/v1/t/${teamID}/calendar/${existing.id}/`
    // TODO: this should be an endpoint so we can have this be in a transaction
    return http
      .delete(sourceURL)
      .then(() => http.patch(sinkURL, { count: existing.count + from.count }))
      .catch(() => {
        dispatch(moveCalendarRecipe(id, pyFormat(from.on)))
      })
  }

  return http.patch(sourceURL, { on: pyFormat(to) }).catch(() => {
    // on error we want to move it back to the old position
    dispatch(moveCalendarRecipe(id, pyFormat(from.on)))
  })
}

export const updatingScheduledRecipe = (
  id: number,
  teamID: number | "personal",
  data: { count: string }
) => (dispatch: Dispatch) => {
  if (parseInt(data.count, 10) <= 0) {
    return dispatch(deletingScheduledRecipe(id, teamID))
  }

  const url =
    teamID === "personal"
      ? `/api/v1/calendar/${id}/`
      : `/api/v1/t/${teamID}/calendar/${id}/`
  return http.patch(url, data).then(res => {
    dispatch(setCalendarRecipe(res.data))
  })
}

export const setScheduleURL = (url: string) => ({
  type: SET_SCHEDULE_URL,
  scheduleURL: url
})
