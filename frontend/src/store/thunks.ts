import pickBy from "lodash/pickBy"
import { random32Id } from "@/uuid"
import { toDateString, second } from "@/date"
import { push, replace } from "react-router-redux"
import { Dispatch as ReduxDispatch } from "redux"
import { AxiosError, AxiosResponse } from "axios"
import raven from "raven-js"
import { store, Action, IState } from "@/store/store"
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
  getCalRecipeById,
  getExistingRecipe
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
import { isOk, isErr, Ok, Err, Result } from "@/result"
import { heldKeys } from "@/components/CurrentKeys"

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
export const showNotificationWithTimeoutAsync = (dispatch: Dispatch) => ({
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

export const loggingOutAsync = (dispatch: Dispatch) => async () => {
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

export const updatingEmailAsync = (dispatch: Dispatch) => async (
  email: IUser["email"]
) => {
  dispatch(updateEmail.request())
  const res = await api.updateUser({ email })

  if (isOk(res)) {
    dispatch(updateEmail.success(res.data))

    showNotificationWithTimeoutAsync(dispatch)({
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

export const updatingTeamIDAsync = (dispatch: Dispatch) => async (
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

export const fetchingUserAsync = (dispatch: Dispatch) => async () => {
  dispatch(fetchUser.request())
  const res = await api.getUser()
  if (isOk(res)) {
    dispatch(fetchUser.success(res.data))
  } else {
    dispatch(fetchUser.failure())
  }
}

export const fetchingSessionsAsync = (dispatch: Dispatch) => async () => {
  dispatch(fetchSessions.request())
  const res = await api.getSessions()
  if (isOk(res)) {
    dispatch(fetchSessions.success(res.data))
  } else {
    dispatch(fetchSessions.failure())
  }
}

export const loggingOutSessionByIdAsync = (dispatch: Dispatch) => async (
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

export const loggingOutAllSessionsAsync = (dispatch: Dispatch) => async () => {
  dispatch(logoutAllSessions.request())
  const res = await api.deleteAllSessions()
  if (isOk(res)) {
    dispatch(logoutAllSessions.success())
  } else {
    dispatch(logoutAllSessions.failure())
  }
}

export const fetchSocialConnectionsAsync = (dispatch: Dispatch) => async () => {
  dispatch(socialConnections.request())
  const res = await api.getSocialConnections()
  if (isOk(res)) {
    dispatch(socialConnections.success(res.data))
  } else {
    dispatch(socialConnections.failure())
  }
}

export const disconnectSocialAccountAsync = (dispatch: Dispatch) => async (
  provider: SocialProvider
) => {
  const res = await api.disconnectSocialAccount(provider)
  if (isOk(res)) {
    dispatch(socialConnections.success(res.data))
    return Ok(undefined)
  }
  return res
}

export const fetchingUserStatsAsync = (dispatch: Dispatch) => async () => {
  dispatch(fetchUserStats.request())
  const res = await api.getUserStats()
  if (isOk(res)) {
    dispatch(fetchUserStats.success(res.data))
  } else {
    dispatch(fetchUserStats.failure())
  }
}

interface IUpdatePassword {
  password1: string
  password2: string
  oldPassword: string
}
export const updatingPasswordAsync = (dispatch: Dispatch) => async ({
  password1,
  password2,
  oldPassword
}: IUpdatePassword) => {
  dispatch(passwordUpdate.request())
  const res = await api.changePassword(password1, password2, oldPassword)
  if (isOk(res)) {
    dispatch(passwordUpdate.success())
    dispatch(push("/"))
    showNotificationWithTimeoutAsync(dispatch)({
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

export const fetchingShoppingListAsync = (dispatch: Dispatch) => async (
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

export const postNewRecipeAsync = (dispatch: Dispatch) => async (
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
    showNotificationWithTimeoutAsync(dispatch)({
      message: "problem creating new recipe",
      level: "danger",
      delay: 5 * second
    })
  }
}

export const fetchingRecentRecipesAsync = (dispatch: Dispatch) => async () => {
  // TODO(sbdchd): these should have their own id array in the reduce and their own actions
  dispatch(fetchRecentRecipes.request())
  const res = await api.getRecentRecipes()
  if (isOk(res)) {
    dispatch(fetchRecentRecipes.success(res.data))
  } else {
    dispatch(fetchRecentRecipes.failure())
  }
}

export const fetchingRecipeListAsync = (dispatch: Dispatch) => async (
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

interface IDeletingIngredientAsyncPayload {
  readonly recipeID: IRecipe["id"]
  readonly ingredientID: IIngredient["id"]
}

export async function deletingIngredientAsync(
  { recipeID, ingredientID }: IDeletingIngredientAsyncPayload,
  dispatch: Dispatch
) {
  const res = await api.deleteIngredient(recipeID, ingredientID)
  if (isOk(res)) {
    dispatch(deleteIngredient.success({ recipeID, ingredientID }))
  } else {
    dispatch(deleteIngredient.failure({ recipeID, ingredientID }))
  }
}

interface IUpdatingStepPayload {
  readonly recipeID: IRecipe["id"]
  readonly stepID: IStep["id"]
  readonly text?: string
  readonly position?: number
}

export const updatingStepAsync = async (
  { recipeID, stepID, ...data }: IUpdatingStepPayload,
  dispatch: Dispatch
) => {
  const res = await api.updateStep(
    recipeID,
    stepID,
    pickBy(data, x => x != null)
  )
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

interface IDeletingStepPayload {
  readonly recipeID: IRecipe["id"]
  readonly stepID: IStep["id"]
}
export const deletingStepAsync = async (
  { recipeID, stepID }: IDeletingStepPayload,
  dispatch: Dispatch
) => {
  const res = await api.deleteStep(recipeID, stepID)
  if (isOk(res)) {
    dispatch(deleteStep.success({ recipeID, stepID }))
  } else {
    dispatch(deleteStep.failure({ recipeID, stepID }))
  }
}

export const logUserInAsync = (dispatch: Dispatch) => async (
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

export const socialLoginAsync = (dispatch: Dispatch) => async (
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

export const socialConnectAsync = (dispatch: Dispatch) => async (
  service: SocialProvider,
  code: unknown
) => {
  await api.connectSocial(service, code)
  dispatch(replace("/settings"))
}

export const signupAsync = (dispatch: Dispatch) => async (
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

export const resetAsync = (dispatch: Dispatch) => async (email: string) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingReset(true))
  dispatch(setErrorReset({}))
  dispatch(clearNotification())
  const res = await api.resetPassword(email)
  if (isOk(res)) {
    dispatch(setLoadingReset(false))
    const message = res && res.data && res.data.detail
    showNotificationWithTimeoutAsync(dispatch)({
      message,
      level: "success"
    })
  } else {
    const err = res.error
    dispatch(setLoadingReset(false))
    showNotificationWithTimeoutAsync(dispatch)({
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
    showNotificationWithTimeoutAsync(dispatch)({
      message: "problem resetting password",
      level: "danger",
      sticky: true
    })
  }
}

export const resetConfirmationAsync = (dispatch: Dispatch) => async (
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
    showNotificationWithTimeoutAsync(dispatch)({
      message,
      level: "success"
    })
    dispatch(push("/login"))
  } else {
    const err = res.error
    dispatch(setLoadingResetConfirmation(false))
    showNotificationWithTimeoutAsync(dispatch)({
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

export const fetchingTeamAsync = (dispatch: Dispatch) => async (
  id: ITeam["id"]
) => {
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

export const fetchingTeamMembersAsync = (dispatch: Dispatch) => async (
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

export const fetchingTeamRecipesAsync = (dispatch: Dispatch) => async (
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

export const settingUserTeamLevelAsync = (dispatch: Dispatch) => async (
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
      showNotificationWithTimeoutAsync(dispatch)({
        message,
        level: "danger",
        delay: 3 * second
      })
      // tslint:enable:no-unsafe-any
    }
    dispatch(setUpdatingUserTeamLevel({ id: teamID, updating: false }))
  }
}

export const deletingMembershipAsync = (dispatch: Dispatch) => async (
  teamID: ITeam["id"],
  id: IMember["id"],
  leaving: boolean = false
) => {
  dispatch(setDeletingMembership({ teamID, membershipID: id, val: true }))
  const res = await api.deleteTeamMember(teamID, id)
  if (isOk(res)) {
    const team = store.getState().teams.byId[teamID]
    const teamName = team ? team.name : "unknown"
    const message = "left team " + teamName
    dispatch(deleteMembership({ teamID, membershipID: id }))
    if (leaving) {
      dispatch(push("/"))
      showNotificationWithTimeoutAsync(dispatch)({
        message,
        level: "success",
        delay: 3 * second
      })
      dispatch(deleteTeam(teamID))
    }
  } else {
    const err = res.error
    const message = err.response && err.response.data
    showNotificationWithTimeoutAsync(dispatch)({
      // tslint:disable-next-line:no-unsafe-any
      message,
      level: "danger",
      delay: 3 * second
    })
    dispatch(setDeletingMembership({ teamID, membershipID: id, val: false }))
  }
}

export const deletingTeamAsync = (dispatch: Dispatch) => async (
  teamID: ITeam["id"]
) => {
  const res = await api.deleteTeam(teamID)
  if (isOk(res)) {
    dispatch(push("/"))
    const team = store.getState().teams.byId[teamID]
    const teamName = team ? team.name : "unknown"
    showNotificationWithTimeoutAsync(dispatch)({
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
    showNotificationWithTimeoutAsync(dispatch)({
      message,
      level: "danger",
      delay: 3 * second
    })
  }
}

export const sendingTeamInvitesAsync = (dispatch: Dispatch) => async (
  teamID: ITeam["id"],
  emails: string[],
  level: IMember["level"]
) => {
  dispatch(setSendingTeamInvites({ teamID, val: true }))
  const res = await api.sendTeamInvites(teamID, emails, level)
  if (isOk(res)) {
    showNotificationWithTimeoutAsync(dispatch)({
      message: "invites sent!",
      level: "success",
      delay: 3 * second
    })
    dispatch(setSendingTeamInvites({ teamID, val: false }))
    return Ok(undefined)
  }
  showNotificationWithTimeoutAsync(dispatch)({
    message: "error sending team invite",
    level: "danger",
    delay: 3 * second
  })
  dispatch(setSendingTeamInvites({ teamID, val: false }))
  return Err(undefined)
}

export const fetchingTeamsAsync = (dispatch: Dispatch) => async () => {
  dispatch(fetchTeams.request())
  const res = await api.getTeamList()
  if (isOk(res)) {
    dispatch(fetchTeams.success(res.data))
  } else {
    dispatch(fetchTeams.failure())
  }
}

export const creatingTeamAsync = (dispatch: Dispatch) => async (
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

export const updatingTeamAsync = (dispatch: Dispatch) => async (
  teamId: ITeam["id"],
  teamKVs: unknown
) => {
  const res = await api.updateTeam(teamId, teamKVs)
  if (isOk(res)) {
    showNotificationWithTimeoutAsync(dispatch)({
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
    showNotificationWithTimeoutAsync(dispatch)({
      message,
      level: "danger",
      delay: 3 * second
    })
  }
}

export const moveRecipeToAsync = (dispatch: Dispatch) => async (
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

export const copyRecipeToAsync = (dispatch: Dispatch) => async (
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
    showNotificationWithTimeoutAsync(dispatch)({
      message: `Problem copying recipe: ${res.error}`,
      level: "danger",
      sticky: true
    })
  }
}

export const fetchingInvitesAsync = (dispatch: Dispatch) => async () => {
  dispatch(fetchInvites.request())
  const res = await api.getInviteList()
  if (isOk(res)) {
    dispatch(fetchInvites.success(res.data))
  } else {
    dispatch(fetchInvites.failure())
  }
}

export const acceptingInviteAsync = (dispatch: Dispatch) => async (
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
export const decliningInviteAsync = (dispatch: Dispatch) => async (
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

export const deleteUserAccountAsync = (dispatch: Dispatch) => async () => {
  const res = await api.deleteLoggedInUser()
  if (isOk(res)) {
    dispatch(setUserLoggedIn(false))
    dispatch(push("/login"))
    showNotificationWithTimeoutAsync(dispatch)({ message: "Account deleted" })
  } else {
    const error = res.error
    // tslint:disable:no-unsafe-any
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data.detail
    ) {
      showNotificationWithTimeoutAsync(dispatch)({
        message: error.response.data.detail,
        level: "danger"
      })
      // tslint:enable:no-unsafe-any
    } else {
      showNotificationWithTimeoutAsync(dispatch)({
        message: "failed to delete account",
        level: "danger"
      })
    }
  }
}

export const reportBadMergeAsync = (dispatch: Dispatch) => async () => {
  const res = await api.reportBadMerge()
  if (isOk(res)) {
    showNotificationWithTimeoutAsync(dispatch)({
      message: "reported bad merge",
      level: "success",
      delay: 3 * second
    })
  } else {
    showNotificationWithTimeoutAsync(dispatch)({
      message: "error reporting bad merge",
      level: "danger",
      delay: 3 * second
    })
  }
}

export const fetchCalendarAsync = (dispatch: Dispatch) => async (
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
    created: String(new Date()),
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

export interface IAddingScheduledRecipeProps {
  readonly recipeID: IRecipe["id"]
  readonly teamID: TeamID
  readonly on: Date
  readonly count: number
  readonly showNotification?: boolean
}

export const addingScheduledRecipeAsync = async (
  dispatch: Dispatch,
  getState: () => IState,
  { recipeID, teamID, on, count, showNotification }: IAddingScheduledRecipeProps
) => {
  // TODO(sbdchd): we should split this into one function for creating a new
  // scheduled recipe and one function for moving a scheduled recipe.
  const recipe = getState().recipes.byId[recipeID]
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
      showNotificationWithTimeoutAsync(dispatch)({
        message,
        level: "success",
        delay: 3 * second
      })
    }
  } else {
    dispatch(deleteCalendarRecipe(tempId))
    showNotificationWithTimeoutAsync(dispatch)({
      message: "error scheduling recipe",
      level: "danger",
      delay: 3 * second
    })
    dispatch(setSchedulingRecipe({ recipeID, scheduling: false }))
  }
}
export const deletingScheduledRecipeAsync = (dispatch: Dispatch) => async (
  id: ICalRecipe["id"],
  teamID: TeamID
) => {
  // HACK(sbdchd): we should have these in byId object / Map
  // TODO(sbdchd): we can just have a marker for deleted recipes and just remove
  // that marker if this fails. Or we could put them in their own id list
  const recipe = store.getState().calendar.byId[id]
  if (recipe == null) {
    return Err(undefined)
  }
  dispatch(deleteCalendarRecipe(id))
  const res = await api.deleteScheduledRecipe(id, teamID)
  if (isErr(res)) {
    dispatch(setCalendarRecipe(recipe))
  }
  return Ok(undefined)
}

export interface IMoveScheduledRecipeProps {
  readonly id: ICalRecipe["id"]
  readonly teamID: TeamID
  readonly to: Date
}

export const moveScheduledRecipe = async (
  dispatch: Dispatch,
  getState: () => IState,
  { id, teamID, to }: IMoveScheduledRecipeProps
) => {
  // HACK(sbdchd): With an endpoint we can eliminate this
  const state = getState()
  const from = getCalRecipeById(state.calendar, id)

  if (from == null) {
    return
  }

  // copy recipe if
  // - recipe from the past
  // - user is holding shift
  const holdingShift = heldKeys.size === 1 && heldKeys.has("Shift")
  const copyRecipe = isPast(endOfDay(from.on)) || holdingShift
  if (copyRecipe) {
    return addingScheduledRecipeAsync(dispatch, getState, {
      recipeID: from.recipe.id,
      teamID,
      on: to,
      count: from.count
    })
  }
  const existing = getExistingRecipe({ state: state.calendar, on: to, from })

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

export const updatingScheduledRecipeAsync = (dispatch: Dispatch) => async (
  id: ICalRecipe["id"],
  teamID: TeamID,
  count: ICalRecipe["count"]
): Promise<Result<undefined, undefined>> => {
  if (count <= 0) {
    return deletingScheduledRecipeAsync(dispatch)(id, teamID)
  }

  const res = await api.updateScheduleRecipe(id, teamID, { count })
  if (isOk(res)) {
    dispatch(setCalendarRecipe(res.data))
    return Ok(undefined)
  }
  return Err(undefined)
}
