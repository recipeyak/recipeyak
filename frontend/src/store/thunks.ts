import isSameDay from "date-fns/is_same_day"
import { random32Id } from "@/uuid"
import { toDateString } from "@/date"
import { push, replace } from "react-router-redux"
import { Dispatch as ReduxDispatch } from "redux"
import { AxiosError, AxiosResponse } from "axios"
import raven from "raven-js"
import { store, Action } from "@/store/store"
import {
  SocialProvider,
  updateEmail,
  updateTeamID,
  fetchUser,
  setUserLoggedIn,
  IUser,
  fetchUserStats,
  IUserState,
  logOut,
  fetchSessions,
  ISession,
  logoutSessionById,
  logoutAllSessions,
  socialConnections
} from "@/store/reducers/user"
import {
  ICalRecipe,
  setCalendarRecipe,
  replaceCalendarRecipe,
  deleteCalendarRecipe,
  moveCalendarRecipe,
  fetchCalendarRecipes,
  getAllCalRecipes,
  getCalRecipeById
} from "@/store/reducers/calendar"
import {
  IInvite,
  fetchInvites,
  declineInvite,
  acceptInvite
} from "@/store/reducers/invites"
import {
  INotificationState,
  setNotification,
  clearNotification
} from "@/store/reducers/notification"
import {
  ITeam,
  deleteTeam,
  setUpdatingUserTeamLevel,
  setUserTeamLevel,
  setDeletingMembership,
  setSendingTeamInvites,
  deleteMembership,
  setCreatingTeam,
  updateTeamById,
  setCopyingTeam,
  IMember,
  fetchTeams,
  fetchTeam,
  setTeam,
  fetchTeamMembers,
  fetchTeamRecipes
} from "@/store/reducers/teams"
import {
  IRecipe,
  setSchedulingRecipe,
  updateRecipeOwner,
  deleteStep,
  updateStep,
  deleteIngredient,
  IIngredient,
  fetchRecipe,
  fetchRecipeList,
  createRecipe,
  IStep,
  fetchRecentRecipes
} from "@/store/reducers/recipes"
import * as api from "@/api"
import { clearAddRecipeForm } from "@/store/reducers/addrecipe"
import { fetchShoppingList } from "@/store/reducers/shoppinglist"
import { passwordUpdate } from "@/store/reducers/passwordChange"
import { IRecipeBasic } from "@/components/RecipeTitle"
import {
  setErrorSocialLogin,
  setErrorSignup,
  setErrorReset,
  setErrorResetConfirmation,
  setLoadingSignup,
  setLoadingReset,
  setLoadingResetConfirmation,
  login
} from "@/store/reducers/auth"
import { recipeURL } from "@/urls"
import { isSuccessOrRefetching } from "@/webdata"
import { isPast, endOfDay } from "date-fns"
import { isOk, isErr, Ok, Err } from "@/result"
import { heldKeys } from "@/components/App"

// TODO(sbdchd): move to @/store/store
export type Dispatch = ReduxDispatch<Action>

const isbadRequest = (err: AxiosError) =>
  err.response && err.response.status === 400

const is404 = (err: AxiosError) => err.response && err.response.status === 404

export interface INotificationWithTimeout {
  readonly delay?: number
  readonly sticky?: boolean
  readonly message: string
  readonly closeable?: boolean
  readonly level?: INotificationState["level"]
}

// https://stackoverflow.com/a/38574266/3555105
let notificationTimeout: NodeJS.Timer
export const showNotificationWithTimeout = (dispatch: Dispatch) => ({
  message,
  level = "info",
  closeable = true,
  delay = 2000,
  sticky = false
}: INotificationWithTimeout) => {
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

export const loggingOut = (dispatch: Dispatch) => async () => {
  dispatch(logOut.request())
  const res = await api.logoutUser()
  if (isOk(res)) {
    dispatch(logOut.success())
    dispatch(push("/login"))
  } else {
    dispatch(logOut.failure())
  }
}

const emailExists = (err: AxiosError) =>
  // tslint:disable:no-unsafe-any
  err.response &&
  err.response.data.email != null &&
  err.response.data.email[0].includes("email already exists")
// tslint:enable:no-unsafe-any

const second = 1000

export const updatingEmail = (dispatch: Dispatch) => async (
  email: IUser["email"]
) => {
  dispatch(updateEmail.request())
  const res = await api.updateUser({ email })

  if (isOk(res)) {
    dispatch(updateEmail.success(res.data))

    showNotificationWithTimeout(dispatch)({
      message: "updated email",
      level: "success",
      delay: 3 * second
    })
  } else {
    dispatch(updateEmail.failure())
    const messageExtra = emailExists(res.error) ? "- email already in use" : ""
    dispatch(
      setNotification({
        message: `problem updating email ${messageExtra}`,
        level: "danger"
      })
    )
  }
}

export const updatingTeamID = (dispatch: Dispatch) => async (
  id: IUserState["teamID"]
) => {
  // store old id so we can undo
  const oldID = store.getState().user.teamID
  dispatch(updateTeamID(id))
  const res = await api.updateUser({ selected_team: id })
  if (isOk(res)) {
    dispatch(fetchUser.success(res.data))
  } else {
    dispatch(updateTeamID(oldID))
  }
}

export const fetchingUser = (dispatch: Dispatch) => async () => {
  dispatch(fetchUser.request())
  const res = await api.getUser()
  if (isOk(res)) {
    dispatch(fetchUser.success(res.data))
  } else {
    dispatch(fetchUser.failure())
  }
}

export const fetchingSessions = (dispatch: Dispatch) => async () => {
  dispatch(fetchSessions.request())
  const res = await api.getSessions()
  if (isOk(res)) {
    dispatch(fetchSessions.success(res.data))
  } else {
    dispatch(fetchSessions.failure())
  }
}

export const loggingOutSessionById = (dispatch: Dispatch) => async (
  id: ISession["id"]
) => {
  dispatch(logoutSessionById.request(id))
  const res = await api.deleteSessionById(id)
  if (isOk(res)) {
    dispatch(logoutSessionById.success(id))
  } else {
    dispatch(logoutSessionById.failure(id))
  }
}

export const loggingOutAllSessions = (dispatch: Dispatch) => async () => {
  dispatch(logoutAllSessions.request())
  const res = await api.deleteAllSessions()
  if (isOk(res)) {
    dispatch(logoutAllSessions.success())
  } else {
    dispatch(logoutAllSessions.failure())
  }
}

export const fetchSocialConnections = (dispatch: Dispatch) => async () => {
  dispatch(socialConnections.request())
  const res = await api.getSocialConnections()
  if (isOk(res)) {
    dispatch(socialConnections.success(res.data))
  } else {
    dispatch(socialConnections.failure())
  }
}

export const disconnectSocialAccount = (dispatch: Dispatch) => async (
  provider: SocialProvider
) => {
  const res = await api.disconnectSocialAccount(provider)
  if (isOk(res)) {
    dispatch(socialConnections.success(res.data))
    return Ok(undefined)
  } else {
    return res
  }
}

export const fetchingUserStats = (dispatch: Dispatch) => async () => {
  dispatch(fetchUserStats.request())
  const res = await api.getUserStats()
  if (isOk(res)) {
    dispatch(fetchUserStats.success(res.data))
  } else {
    dispatch(fetchUserStats.failure())
  }
}

export const updatingPassword = (dispatch: Dispatch) => async (
  password1: string,
  password2: string,
  oldPassword: string
) => {
  dispatch(passwordUpdate.request())
  const res = await api.changePassword(password1, password2, oldPassword)
  if (isOk(res)) {
    dispatch(passwordUpdate.success())
    dispatch(push("/"))
    showNotificationWithTimeout(dispatch)({
      message: "Successfully updated password",
      level: "success"
    })
  } else {
    const err = res.error
    const badRequest = err.response && err.response.status === 400
    if (err.response && badRequest) {
      const data = err.response.data
      // tslint:disable:no-unsafe-any
      dispatch(
        passwordUpdate.failure({
          newPasswordAgain: data["new_password2"],
          newPassword: data["new_password1"],
          oldPassword: data["old_password"]
        })
      )
      return
      // tslint:ebale:no-unsafe-any
    }
    dispatch(passwordUpdate.failure())
  }
}

export const fetchingShoppingList = (dispatch: Dispatch) => async (
  teamID: TeamID
) => {
  const startDay = store.getState().shoppinglist.startDay
  const endDay = store.getState().shoppinglist.endDay
  dispatch(fetchShoppingList.request())
  const res = await api.getShoppingList(teamID, startDay, endDay)
  if (isOk(res)) {
    dispatch(fetchShoppingList.success(res.data))
  } else {
    dispatch(fetchShoppingList.failure())
  }
}

export const postNewRecipe = (dispatch: Dispatch) => async (
  recipe: IRecipeBasic
) => {
  dispatch(createRecipe.request())
  const res = await api.createRecipe(recipe)
  if (isOk(res)) {
    dispatch(createRecipe.success(res.data))
    dispatch(push(recipeURL(res.data.id)))
    dispatch(clearAddRecipeForm())
  } else {
    const err = res.error
    // tslint:disable:no-unsafe-any
    const errors =
      (err.response && {
        errorWithName: err.response.data.name != null,
        errorWithIngredients: err.response.data.ingredients != null,
        errorWithSteps: err.response.data.steps != null
      }) ||
      {}
    // tslint:enable:no-unsafe-any
    dispatch(createRecipe.failure(errors))
    showNotificationWithTimeout(dispatch)({
      message: "problem creating new recipe",
      level: "danger",
      delay: 5 * second
    })
  }
}

export const fetchingRecentRecipes = (dispatch: Dispatch) => async () => {
  // TODO(sbdchd): these should have their own id array in the reduce and their own actions
  dispatch(fetchRecentRecipes.request())
  const res = await api.getRecentRecipes()
  if (isOk(res)) {
    dispatch(fetchRecentRecipes.success(res.data))
  } else {
    dispatch(fetchRecentRecipes.failure())
  }
}

export const fetchingRecipeList = (dispatch: Dispatch) => async (
  teamID: TeamID
) => {
  dispatch(fetchRecipeList.request({ teamID }))
  const res = await api.getRecipeList(teamID)
  if (isOk(res)) {
    dispatch(fetchRecipeList.success({ recipes: res.data, teamID }))
  } else {
    dispatch(fetchRecipeList.failure({ teamID }))
  }
}

export const deletingIngredient = (dispatch: Dispatch) => async (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"]
) => {
  dispatch(deleteIngredient.request({ recipeID, ingredientID }))
  const res = await api.deleteIngredient(recipeID, ingredientID)
  if (isOk(res)) {
    dispatch(deleteIngredient.success({ recipeID, ingredientID }))
  } else {
    dispatch(deleteIngredient.failure({ recipeID, ingredientID }))
  }
}

export const updatingStep = (dispatch: Dispatch) => async (
  recipeID: IRecipe["id"],
  stepID: IStep["id"],
  { text, position }: { text?: string; position?: number }
) => {
  dispatch(updateStep.request({ recipeID, stepID }))
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
  const res = await api.updateStep(recipeID, stepID, data)
  if (isOk(res)) {
    dispatch(
      updateStep.success({
        recipeID,
        stepID,
        text: res.data.text,
        position: res.data.position
      })
    )
  } else {
    dispatch(updateStep.failure({ recipeID, stepID }))
  }
}

export const deletingStep = (dispatch: Dispatch) => async (
  recipeID: IRecipe["id"],
  stepID: IStep["id"]
) => {
  dispatch(deleteStep.request({ recipeID, stepID }))
  const res = await api.deleteStep(recipeID, stepID)
  if (isOk(res)) {
    dispatch(deleteStep.success({ recipeID, stepID }))
  } else {
    dispatch(deleteStep.failure({ recipeID, stepID }))
  }
}

export const logUserIn = (dispatch: Dispatch) => async (
  email: string,
  password: string,
  redirectUrl: string = ""
) => {
  dispatch(clearNotification())
  dispatch(login.request())
  const res = await api.loginUser(email, password)

  if (isOk(res)) {
    dispatch(login.success(res.data.user))
    dispatch(push(redirectUrl))
  } else {
    const err = res.error
    const badRequest = err.response && err.response.status === 400
    if (err.response && badRequest) {
      const data = err.response.data
      // tslint:disable:no-unsafe-any
      dispatch(
        login.failure({
          email: data["email"],
          password1: data["password1"],
          nonFieldErrors: data["non_field_errors"]
        })
      )
      // tslint:enable:no-unsafe-any
      return
    }
    dispatch(login.failure())
  }
}

export const socialLogin = (dispatch: Dispatch) => async (
  service: SocialProvider,
  token: string,
  redirectUrl: string = ""
) => {
  const res = await api.loginUserWithSocial(service, token)

  if (isOk(res)) {
    dispatch(login.success(res.data.user))
    dispatch(replace(redirectUrl))
  } else {
    const err = res.error
    const badRequest = err.response && err.response.status === 400
    if (err.response && badRequest) {
      const data = err.response.data
      // tslint:disable:no-unsafe-any
      dispatch(
        setErrorSocialLogin({
          emailSocial: data["email"],
          nonFieldErrorsSocial: data["non_field_errors"]
        })
      )
      // tslint:enable:no-unsafe-any
    }
    dispatch(replace("/login"))
  }
}

export const socialConnect = (dispatch: Dispatch) => async (
  service: SocialProvider,
  code: unknown
) => {
  await api.connectSocial(service, code)
  dispatch(replace("/settings"))
}

export const signup = (dispatch: Dispatch) => async (
  email: string,
  password1: string,
  password2: string
) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingSignup(true))
  // clear previous signup errors
  dispatch(setErrorSignup({}))
  dispatch(clearNotification())

  const res = await api.signup(email, password1, password2)

  if (isOk(res)) {
    dispatch(login.success(res.data.user))
    dispatch(setLoadingSignup(false))
    dispatch(push("/recipes/add"))
  } else {
    const err = res.error
    if (isbadRequest(err)) {
      // tslint:disable:no-unsafe-any
      const data = err.response && err.response.data
      dispatch(
        setErrorSignup({
          email: data["email"],
          password1: data["password1"],
          password2: data["password2"],
          nonFieldErrors: data["non_field_errors"]
        })
      )
      // tslint:enable:no-unsafe-any
    }
    dispatch(setLoadingSignup(false))
  }
}

export const reset = (dispatch: Dispatch) => async (email: string) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingReset(true))
  dispatch(setErrorReset({}))
  dispatch(clearNotification())
  const res = await api.resetPassword(email)
  if (isOk(res)) {
    dispatch(setLoadingReset(false))
    const message = res && res.data && res.data.detail
    showNotificationWithTimeout(dispatch)({
      message,
      level: "success"
    })
  } else {
    const err = res.error
    dispatch(setLoadingReset(false))
    showNotificationWithTimeout(dispatch)({
      message: "uh oh! problem resetting password",
      level: "danger",
      sticky: true
    })
    if (isbadRequest(err)) {
      // tslint:disable:no-unsafe-any
      const data = err.response && err.response.data
      dispatch(
        setErrorReset({
          email: data["email"],
          nonFieldErrors: data["non_field_errors"]
        })
      )
      // tslint:enable:no-unsafe-any
    }
    showNotificationWithTimeout(dispatch)({
      message: "problem resetting password",
      level: "danger",
      sticky: true
    })
  }
}

export const resetConfirmation = (dispatch: Dispatch) => async (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string
) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingResetConfirmation(true))
  dispatch(setErrorResetConfirmation({}))
  dispatch(clearNotification())

  const res = await api.resetPasswordConfirm(
    uid,
    token,
    newPassword1,
    newPassword2
  )
  if (isOk(res)) {
    dispatch(setLoadingResetConfirmation(false))
    const message = res && res.data && res.data.detail
    showNotificationWithTimeout(dispatch)({
      message,
      level: "success"
    })
    dispatch(push("/login"))
  } else {
    const err = res.error
    dispatch(setLoadingResetConfirmation(false))
    showNotificationWithTimeout(dispatch)({
      message: "uh oh! problem resetting password",
      level: "danger",
      sticky: true
    })
    if (isbadRequest(err)) {
      // tslint:disable:no-unsafe-any
      const data = err.response && err.response.data

      const tokenData =
        data["token"] && data["token"].map((x: unknown) => "token: " + x)
      const uidData =
        data["uid"] && data["uid"].map((x: unknown) => "uid: " + x)
      const nonFieldErrors = []
        .concat(data["non_field_errors"])
        .concat(tokenData)
        .concat(uidData)

      dispatch(
        setErrorResetConfirmation({
          newPassword1: data["new_password1"],
          newPassword2: data["new_password2"],
          nonFieldErrors
        })
      )
      // tslint:enable:no-unsafe-any
    }
  }
}

export const fetchingTeam = (dispatch: Dispatch) => async (id: ITeam["id"]) => {
  dispatch(fetchTeam.request(id))
  const res = await api.getTeam(id)
  if (isOk(res)) {
    dispatch(fetchTeam.success(res.data))
  } else {
    const err = res.error
    if (is404(err)) {
      dispatch(fetchTeam.failure({ id, error404: true }))
      return
    }
    dispatch(fetchTeam.failure({ id }))
  }
}

export const fetchingTeamMembers = (dispatch: Dispatch) => async (
  id: ITeam["id"]
) => {
  dispatch(fetchTeamMembers.request(id))
  const res = await api.getTeamMembers(id)
  if (isOk(res)) {
    dispatch(fetchTeamMembers.success({ id, members: res.data }))
  } else {
    dispatch(fetchTeamMembers.failure(id))
  }
}

export const fetchingTeamRecipes = (dispatch: Dispatch) => async (
  id: ITeam["id"]
) => {
  dispatch(fetchTeamRecipes.request(id))
  const res = await api.getTeamRecipes(id)
  if (isOk(res)) {
    // TODO(sbdchd): kind of hacky
    dispatch(fetchRecipeList.success({ recipes: res.data, teamID: id }))
    dispatch(fetchTeamRecipes.success({ id, recipes: res.data }))
  } else {
    dispatch(fetchTeamRecipes.failure(id))
  }
}

// tslint:disable:no-unsafe-any
const attemptedDeleteLastAdmin = (res: AxiosResponse) =>
  res.status === 400 &&
  res.data.level &&
  res.data.level[0].includes("cannot demote")
// tslint:enable:no-unsafe-any

export const settingUserTeamLevel = (dispatch: Dispatch) => async (
  teamID: ITeam["id"],
  membershipID: IMember["id"],
  level: IMember["level"]
) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setUpdatingUserTeamLevel({ id: teamID, updating: true }))
  const res = await api.updateTeamMemberLevel(teamID, membershipID, level)
  if (isOk(res)) {
    dispatch(setUserTeamLevel({ teamID, membershipID, level: res.data.level }))
    dispatch(setUpdatingUserTeamLevel({ id: teamID, updating: false }))
  } else {
    const err = res.error
    if (err.response && attemptedDeleteLastAdmin(err.response)) {
      // tslint:disable:no-unsafe-any
      const message = err.response.data.level[0]
      showNotificationWithTimeout(dispatch)({
        message,
        level: "danger",
        delay: 3 * second
      })
      // tslint:enable:no-unsafe-any
    }
    dispatch(setUpdatingUserTeamLevel({ id: teamID, updating: false }))
  }
}

export const deletingMembership = (dispatch: Dispatch) => async (
  teamID: ITeam["id"],
  id: IMember["id"],
  leaving: boolean = false
) => {
  dispatch(setDeletingMembership({ teamID, membershipID: id, val: true }))
  const res = await api.deleteTeamMember(teamID, id)
  if (isOk(res)) {
    const message = "left team " + store.getState().teams.byId[teamID].name
    dispatch(deleteMembership({ teamID, membershipID: id }))
    if (leaving) {
      dispatch(push("/"))
      showNotificationWithTimeout(dispatch)({
        message,
        level: "success",
        delay: 3 * second
      })
      dispatch(deleteTeam(teamID))
    }
  } else {
    const err = res.error
    const message = err.response && err.response.data
    showNotificationWithTimeout(dispatch)({
      // tslint:disable-next-line:no-unsafe-any
      message,
      level: "danger",
      delay: 3 * second
    })
    dispatch(setDeletingMembership({ teamID, membershipID: id, val: false }))
  }
}

export const deletingTeam = (dispatch: Dispatch) => async (
  teamID: ITeam["id"]
) => {
  const res = await api.deleteTeam(teamID)
  if (isOk(res)) {
    dispatch(push("/"))
    const teamName = store.getState().teams.byId[teamID].name
    showNotificationWithTimeout(dispatch)({
      message: `Team deleted (${teamName})`,
      level: "success",
      delay: 3 * second
    })
    dispatch(deleteTeam(teamID))
  } else {
    const err = res.error
    let message = "Uh Oh! Something went wrong."
    // tslint:disable:no-unsafe-any
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
    // tslint:enable:no-unsafe-any
    showNotificationWithTimeout(dispatch)({
      message,
      level: "danger",
      delay: 3 * second
    })
  }
}

export const sendingTeamInvites = (dispatch: Dispatch) => async (
  teamID: ITeam["id"],
  emails: string[],
  level: IMember["level"]
) => {
  dispatch(setSendingTeamInvites({ teamID, val: true }))
  const res = await api.sendTeamInvites(teamID, emails, level)
  if (isOk(res)) {
    showNotificationWithTimeout(dispatch)({
      message: "invites sent!",
      level: "success",
      delay: 3 * second
    })
    dispatch(setSendingTeamInvites({ teamID, val: false }))
    return Ok(undefined)
  } else {
    showNotificationWithTimeout(dispatch)({
      message: "error sending team invite",
      level: "danger",
      delay: 3 * second
    })
    dispatch(setSendingTeamInvites({ teamID, val: false }))
    return Err(undefined)
  }
}

export const fetchingTeams = (dispatch: Dispatch) => async () => {
  dispatch(fetchTeams.request())
  const res = await api.getTeamList()
  if (isOk(res)) {
    dispatch(fetchTeams.success(res.data))
  } else {
    dispatch(fetchTeams.failure())
  }
}

export const creatingTeam = (dispatch: Dispatch) => async (
  name: ITeam["name"],
  emails: string[],
  level: IMember["level"]
) => {
  // TODO(sbdchd): use createAsyncActions
  dispatch(setCreatingTeam(true))
  const res = await api.createTeam(name, emails, level)
  if (isOk(res)) {
    dispatch(setTeam({ id: res.data.id, team: res.data }))
    dispatch(setCreatingTeam(false))
    dispatch(push(`/t/${res.data.id}`))
  } else {
    dispatch(setCreatingTeam(false))
  }
}

export const updatingTeam = (dispatch: Dispatch) => async (
  teamId: ITeam["id"],
  teamKVs: unknown
) => {
  const res = await api.updateTeam(teamId, teamKVs)
  if (isOk(res)) {
    showNotificationWithTimeout(dispatch)({
      message: "Team updated",
      level: "success",
      delay: 3 * second
    })
    dispatch(updateTeamById({ id: res.data.id, teamKeys: res.data }))
  } else {
    const err = res.error
    let message = "Problem updating team."
    // tslint:disable-next-line:no-unsafe-any
    if (err.response && err.response.status === 403) {
      message = "You are not authorized to perform that action"
    }
    showNotificationWithTimeout(dispatch)({
      message,
      level: "danger",
      delay: 3 * second
    })
  }
}

export const moveRecipeTo = (dispatch: Dispatch) => async (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: IRecipe["owner"]["type"]
) => {
  const res = await api.moveRecipe(recipeId, ownerId, type)
  if (isOk(res)) {
    dispatch(updateRecipeOwner({ id: res.data.id, owner: res.data.owner }))
    return Ok(undefined)
  }
  return Err(undefined)
}

export const copyRecipeTo = (dispatch: Dispatch) => async (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: IRecipe["owner"]["type"]
) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setCopyingTeam(true))
  const res = await api.copyRecipe(recipeId, ownerId, type)
  if (isOk(res)) {
    dispatch(fetchRecipe.success(res.data))
    dispatch(setCopyingTeam(false))
  } else {
    dispatch(setCopyingTeam(false))
    // TODO(chdsbd): Improve api usage and remove this throw
    // tslint:disable-next-line:no-throw
    showNotificationWithTimeout(dispatch)({
      message: `Problem copying recipe: ${res.error}`,
      level: "danger",
      sticky: true
    })
  }
}

export const fetchingInvites = (dispatch: Dispatch) => async () => {
  dispatch(fetchInvites.request())
  const res = await api.getInviteList()
  if (isOk(res)) {
    dispatch(fetchInvites.success(res.data))
  } else {
    dispatch(fetchInvites.failure())
  }
}

export const acceptingInvite = (dispatch: Dispatch) => async (
  id: IInvite["id"]
) => {
  dispatch(acceptInvite.request(id))
  const res = await api.acceptInvite(id)
  if (isOk(res)) {
    dispatch(acceptInvite.success(id))
  } else {
    dispatch(acceptInvite.failure(id))
  }
}
export const decliningInvite = (dispatch: Dispatch) => async (
  id: IInvite["id"]
) => {
  dispatch(declineInvite.request(id))
  const res = await api.declineInvite(id)
  if (isOk(res)) {
    dispatch(declineInvite.success(id))
  } else {
    dispatch(declineInvite.failure(id))
  }
}

export const deleteUserAccount = (dispatch: Dispatch) => async () => {
  const res = await api.deleteLoggedInUser()
  if (isOk(res)) {
    dispatch(setUserLoggedIn(false))
    dispatch(push("/login"))
    showNotificationWithTimeout(dispatch)({ message: "Account deleted" })
  } else {
    const error = res.error
    // tslint:disable:no-unsafe-any
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data.detail
    ) {
      showNotificationWithTimeout(dispatch)({
        message: error.response.data.detail,
        level: "danger"
      })
      // tslint:enable:no-unsafe-any
    } else {
      showNotificationWithTimeout(dispatch)({
        message: "failed to delete account",
        level: "danger"
      })
    }
  }
}

export const reportBadMerge = (dispatch: Dispatch) => async () => {
  const res = await api.reportBadMerge()
  if (isOk(res)) {
    showNotificationWithTimeout(dispatch)({
      message: "reported bad merge",
      level: "success",
      delay: 3 * second
    })
  } else {
    showNotificationWithTimeout(dispatch)({
      message: "error reporting bad merge",
      level: "danger",
      delay: 3 * second
    })
  }
}

export const fetchCalendar = (dispatch: Dispatch) => async (
  teamID: TeamID,
  month = new Date()
) => {
  dispatch(fetchCalendarRecipes.request())
  // we fetch current month plus and minus 1 week
  const res = await api.getCalendarRecipeList(teamID, month)
  if (isOk(res)) {
    dispatch(fetchCalendarRecipes.success(res.data))
  } else {
    dispatch(fetchCalendarRecipes.failure())
  }
}

function toCalRecipe(
  recipe: IRecipe,
  tempId: ICalRecipe["id"],
  on: ICalRecipe["on"],
  count: ICalRecipe["count"]
): ICalRecipe {
  return {
    id: tempId,
    recipe: {
      id: recipe.id,
      name: recipe.name
    },
    on: toDateString(on),
    count,
    user: recipe.owner.type === "user" ? recipe.owner.id : null,
    team: recipe.owner.type === "team" ? recipe.owner.id : null
  }
}

export const addingScheduledRecipe = (dispatch: Dispatch) => async (
  recipeID: IRecipe["id"],
  teamID: TeamID,
  on: Date,
  count: number,
  showNotification?: boolean
) => {
  const recipe = store.getState().recipes.byId[recipeID]
  dispatch(setSchedulingRecipe({ recipeID, scheduling: true }))
  const tempId = random32Id()
  if (!isSuccessOrRefetching(recipe)) {
    return Promise.resolve()
  }

  // 1. preemptively add recipe
  // 2. if succeeded, then we replace the preemptively added one
  //    if failed, then we remove the preemptively added one, and display an error

  dispatch(
    setCalendarRecipe(toCalRecipe(recipe.data, tempId, toDateString(on), count))
  )
  const res = await api.scheduleRecipe(recipeID, teamID, on, count)

  if (isOk(res)) {
    dispatch(replaceCalendarRecipe({ id: tempId, recipe: res.data }))
    dispatch(setSchedulingRecipe({ recipeID, scheduling: false }))
    const scheduledDate = new Date(res.data.on).toLocaleDateString()
    const recipeName = res.data.recipe.name
    if (showNotification) {
      const message = `${recipeName} scheduled on ${scheduledDate}`
      showNotificationWithTimeout(dispatch)({
        message,
        level: "success",
        delay: 3 * second
      })
    }
  } else {
    dispatch(deleteCalendarRecipe(tempId))
    showNotificationWithTimeout(dispatch)({
      message: "error scheduling recipe",
      level: "danger",
      delay: 3 * second
    })
    dispatch(setSchedulingRecipe({ recipeID, scheduling: false }))
  }
}
export const deletingScheduledRecipe = (dispatch: Dispatch) => async (
  id: ICalRecipe["id"],
  teamID: TeamID
) => {
  // HACK(sbdchd): we should have these in byId object / Map
  // TODO(sbdchd): we can just have a marker for deleted recipes and just remove
  // that marker if this fails. Or we could put them in their own id list
  const recipe = store.getState().calendar.byId[id]
  dispatch(deleteCalendarRecipe(id))
  const res = await api.deleteScheduledRecipe(id, teamID)
  if (isErr(res)) {
    dispatch(setCalendarRecipe(recipe))
  }
}

function isSameTeam(x: ICalRecipe, teamID: TeamID): boolean {
  if (teamID === "personal") {
    return x.user != null
  }
  return x.team === teamID
}

export const moveScheduledRecipe = (dispatch: Dispatch) => async (
  id: ICalRecipe["id"],
  teamID: TeamID,
  to: Date
) => {
  // HACK(sbdchd): With an endpoint we can eliminate this
  const state = store.getState()
  const from = getCalRecipeById(state, id)

  // copy recipe if
  // - recipe from the past
  // - user is holding shift
  const holdingShift = heldKeys.size === 1 && heldKeys.has("Shift")
  const copyRecipe = isPast(endOfDay(from.on)) || holdingShift
  if (copyRecipe) {
    return addingScheduledRecipe(dispatch)(
      from.recipe.id,
      teamID,
      to,
      from.count
    )
  }
  const existing = getAllCalRecipes(state)
    .filter(x => isSameDay(x.on, to) && isSameTeam(x, teamID))
    .find(x => x.recipe.id === from.recipe.id)

  // Note(sbdchd): we need move to be after the checking of the store so we
  // don't delete the `from` recipe and update the `existing`
  dispatch(moveCalendarRecipe({ id, to: toDateString(to) }))

  if (existing) {
    // HACK(sbdchd): this should be an endpoint so we can have this be in a transaction
    const resp = await api.deleteScheduledRecipe(from.id, teamID)
    if (isOk(resp)) {
      api.updateScheduleRecipe(existing.id, teamID, {
        count: existing.count + from.count
      })
    } else {
      dispatch(moveCalendarRecipe({ id, to: toDateString(from.on) }))
    }
  }

  const res = await api.updateScheduleRecipe(id, teamID, {
    on: toDateString(to)
  })
  if (isErr(res)) {
    // on error we want to move it back to the old position
    dispatch(moveCalendarRecipe({ id, to: toDateString(from.on) }))
  }
}

export const updatingScheduledRecipe = (dispatch: Dispatch) => async (
  id: ICalRecipe["id"],
  teamID: TeamID,
  count: ICalRecipe["count"]
) => {
  if (count <= 0) {
    return deletingScheduledRecipe(dispatch)(id, teamID)
  }

  const res = await api.updateScheduleRecipe(id, teamID, { count })
  if (isOk(res)) {
    dispatch(setCalendarRecipe(res.data))
    return Ok(undefined)
  }
  return Err(undefined)
}
