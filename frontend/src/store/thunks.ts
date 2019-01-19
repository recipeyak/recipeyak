import isSameDay from "date-fns/is_same_day"

export type Dispatch = ReduxDispatch<Action>

import { random32Id } from "@/uuid"

import { toDateString } from "@/date"

import { push, replace } from "react-router-redux"
import { AxiosError, AxiosResponse } from "axios"
import raven from "raven-js"

import { store, Action } from "@/store/store"
import {
  SocialProvider,
  updateEmail,
  updateTeamID,
  fetchUser,
  setSocialConnections,
  login,
  setUserLoggedIn,
  IUser,
  ISocialConnection,
  fetchUserStats,
  IUserState,
  logOut
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
  setDecliningInvite,
  setDeclinedInvite,
  setAcceptingInvite,
  setAcceptedInvite,
  IInvite,
  fetchInvites
} from "@/store/reducers/invites"
import {
  INotificationState,
  setNotification,
  clearNotification
} from "@/store/reducers/notification"
import {
  ITeam,
  deleteTeam,
  addTeam,
  setLoadingTeam,
  setLoadingTeamMembers,
  setLoadingTeamRecipes,
  setTeamMembers,
  setTeam404,
  setTeamRecipes,
  setUpdatingUserTeamLevel,
  setUserTeamLevel,
  setDeletingMembership,
  setSendingTeamInvites,
  deleteMembership,
  setCreatingTeam,
  setTeam,
  updateTeamById,
  setCopyingTeam,
  IMember,
  fetchTeams
} from "@/store/reducers/teams"
import {
  IRecipe,
  setSchedulingRecipe,
  updateRecipeOwner,
  deleteRecipe,
  deleteStep,
  updateStep,
  deleteIngredient,
  addStepToRecipe,
  addIngredientToRecipe,
  updateIngredient,
  IIngredient,
  fetchRecipe,
  fetchRecipeList,
  createRecipe,
  IStep,
  fetchRecentRecipes,
  updateRecipe
} from "@/store/reducers/recipes"
import * as api from "@/api"
import { clearAddRecipeForm } from "@/store/reducers/addrecipe"
import { fetchShoppingList } from "@/store/reducers/shoppinglist"
import { passwordUpdate } from "@/store/reducers/passwordChange"
import { Dispatch as ReduxDispatch } from "redux"
import { IRecipeBasic } from "@/components/RecipeTitle"
import {
  setErrorLogin,
  setErrorSocialLogin,
  setErrorSignup,
  setErrorReset,
  setErrorResetConfirmation,
  setLoadingLogin,
  setLoadingSignup,
  setLoadingReset,
  setLoadingResetConfirmation
} from "@/store/reducers/auth"
import { recipeURL } from "@/urls"
import { isSuccessOrRefetching } from "@/webdata"

// We check if detail matches our string because Django will not return 401 when
// the session expires
export const invalidToken = (res: AxiosResponse) =>
  // tslint:disable:no-unsafe-any
  res != null &&
  res.data.detail === "Authentication credentials were not provided."
// tslint:enable:no-unsafe-any

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

export const loggingOut = (dispatch: Dispatch) => () => {
  dispatch(logOut.request())
  return api
    .logoutUser()
    .then(() => {
      dispatch(logOut.success())
      dispatch(push("/login"))
    })
    .catch(() => {
      dispatch(logOut.failure())
    })
}

const emailExists = (err: AxiosError) =>
  // tslint:disable:no-unsafe-any
  err.response &&
  err.response.data.email != null &&
  err.response.data.email[0].includes("email already exists")
// tslint:enable:no-unsafe-any

const second = 1000

export const updatingEmail = (dispatch: Dispatch) => (
  email: IUser["email"]
) => {
  dispatch(updateEmail.request())
  return api
    .updateUser({ email })
    .then(res => {
      dispatch(updateEmail.success(res.data))

      showNotificationWithTimeout(dispatch)({
        message: "updated email",
        level: "success",
        delay: 3 * second
      })
    })
    .catch((err: AxiosError) => {
      dispatch(updateEmail.failure())
      const messageExtra = emailExists(err) ? "- email already in use" : ""
      dispatch(
        setNotification({
          message: `problem updating email ${messageExtra}`,
          level: "danger"
        })
      )
    })
}

export const updatingTeamID = (dispatch: Dispatch) => (
  id: IUserState["teamID"]
) => {
  // store old id so we can undo
  const oldID = store.getState().user.teamID
  dispatch(updateTeamID(id))
  api
    .updateUser({ selected_team: id })
    .then(res => {
      dispatch(fetchUser.success(res.data))
    })
    .catch(() => {
      dispatch(updateTeamID(oldID))
    })
}

export const fetchingUser = (dispatch: Dispatch) => () => {
  dispatch(fetchUser.request())
  return api
    .getUser()
    .then(res => {
      dispatch(fetchUser.success(res.data))
    })
    .catch(() => {
      dispatch(fetchUser.failure())
    })
}

export const fetchSocialConnections = (dispatch: Dispatch) => () => {
  return api
    .getSocialConnections()
    .then(res => {
      dispatch(setSocialConnections(res.data))
    })
    .catch(() => undefined)
}

/** Disconnect social account by id
 *
 * We intentionally do _not_ catch any error as we catch in the view. This is
 * poor form and should be refactored.
 *
 * TODO(chdsbd): Refactor API usage to not catch in view.
 */
export const disconnectSocialAccount = (dispatch: Dispatch) => (
  provider: SocialProvider,
  id: ISocialConnection["id"]
) => {
  return api.disconnectSocialAccount(id).then(() => {
    dispatch(
      setSocialConnections([
        {
          provider,
          id: null
        }
      ])
    )
  })
}

export const fetchingUserStats = (dispatch: Dispatch) => () => {
  dispatch(fetchUserStats.request())
  return api
    .getUserStats()
    .then(res => {
      dispatch(fetchUserStats.success(res.data))
    })
    .catch(() => {
      dispatch(fetchUserStats.failure())
    })
}

export const updatingPassword = (dispatch: Dispatch) => (
  password1: string,
  password2: string,
  oldPassword: string
) => {
  dispatch(passwordUpdate.request())
  return api
    .changePassword(password1, password2, oldPassword)
    .then(() => {
      dispatch(passwordUpdate.success())
      dispatch(push("/"))
      showNotificationWithTimeout(dispatch)({
        message: "Successfully updated password",
        level: "success"
      })
    })
    .catch((err: AxiosError) => {
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
    })
}

export const fetchingShoppingList = (dispatch: Dispatch) => (
  teamID: TeamID,
  start?: Date,
  end?: Date
) => {
  dispatch(fetchShoppingList.request())
  return api
    .getShoppingList(teamID, start, end)
    .then(res => {
      dispatch(fetchShoppingList.success(res.data))
    })
    .catch(() => {
      dispatch(fetchShoppingList.failure())
    })
}

export const postNewRecipe = (dispatch: Dispatch) => (recipe: IRecipeBasic) => {
  dispatch(createRecipe.request())
  return api
    .createRecipe(recipe)
    .then(res => {
      dispatch(createRecipe.success(res.data))
      dispatch(push(recipeURL(res.data.id)))
      dispatch(clearAddRecipeForm())
    })
    .catch((err: AxiosError) => {
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
    })
}

export const fetchingRecipe = (dispatch: Dispatch) => (id: IRecipe["id"]) => {
  dispatch(fetchRecipe.request(id))
  return api
    .getRecipe(id)
    .then(res => {
      dispatch(fetchRecipe.success(res.data))
    })
    .catch((err: AxiosError) => {
      const error404 = !!(err.response && err.response.status === 404)
      dispatch(fetchRecipe.failure({ id, error404 }))
    })
}

export const fetchingRecentRecipes = (dispatch: Dispatch) => () => {
  // TODO(sbdchd): these should have their own id array in the reduce and their own actions
  dispatch(fetchRecentRecipes.request())
  return api
    .getRecentRecipes()
    .then(res => {
      dispatch(fetchRecentRecipes.success(res.data))
    })
    .catch(() => {
      dispatch(fetchRecentRecipes.failure())
    })
}

export const fetchingRecipeList = (dispatch: Dispatch) => (teamID: TeamID) => {
  dispatch(fetchRecipeList.request({ teamID }))
  return api
    .getRecipeList(teamID)
    .then(res => {
      dispatch(fetchRecipeList.success({ recipes: res.data, teamID }))
    })
    .catch(() => {
      dispatch(fetchRecipeList.failure({ teamID }))
    })
}

export const addingRecipeIngredient = (dispatch: Dispatch) => (
  recipeID: IRecipe["id"],
  ingredient: unknown
) => {
  dispatch(addIngredientToRecipe.request(recipeID))
  return api
    .addIngredientToRecipe(recipeID, ingredient)
    .then(res => {
      dispatch(
        addIngredientToRecipe.success({ id: recipeID, ingredient: res.data })
      )
    })
    .catch(() => {
      dispatch(addIngredientToRecipe.failure(recipeID))
    })
}

export const updatingRecipe = (dispatch: Dispatch) => (
  id: IRecipe["id"],
  data: unknown
) => {
  dispatch(updateRecipe.request(id))
  return api
    .updateRecipe(id, data)
    .then(res => {
      // TODO(sbdchd): this should have its own actions
      dispatch(updateRecipe.success(res.data))
    })
    .catch(() => {
      dispatch(updateRecipe.failure(id))
    })
}

export const addingRecipeStep = (dispatch: Dispatch) => (
  recipeID: IRecipe["id"],
  step: unknown
) => {
  dispatch(addStepToRecipe.request(recipeID))
  return api
    .addStepToRecipe(recipeID, step)
    .then(res => {
      dispatch(addStepToRecipe.success({ id: recipeID, step: res.data }))
    })
    .catch(() => {
      dispatch(addStepToRecipe.failure(recipeID))
    })
}

export const updatingIngredient = (dispatch: Dispatch) => (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"],
  content: unknown
) => {
  dispatch(updateIngredient.request({ recipeID, ingredientID }))
  return api
    .updateIngredient(recipeID, ingredientID, content)
    .then(res => {
      dispatch(
        updateIngredient.success({ recipeID, ingredientID, content: res.data })
      )
    })
    .catch(() => {
      dispatch(updateIngredient.failure({ recipeID, ingredientID }))
    })
}

export const deletingIngredient = (dispatch: Dispatch) => (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"]
) => {
  dispatch(deleteIngredient.request({ recipeID, ingredientID }))
  return api
    .deleteIngredient(recipeID, ingredientID)
    .then(() => {
      dispatch(deleteIngredient.success({ recipeID, ingredientID }))
    })
    .catch(() => {
      dispatch(deleteIngredient.failure({ recipeID, ingredientID }))
    })
}

export const updatingStep = (dispatch: Dispatch) => (
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
  return api
    .updateStep(recipeID, stepID, data)
    .then(res => {
      dispatch(
        updateStep.success({
          recipeID,
          stepID,
          text: res.data.text,
          position: res.data.position
        })
      )
    })
    .catch(() => {
      dispatch(updateStep.failure({ recipeID, stepID }))
    })
}

export const deletingStep = (dispatch: Dispatch) => (
  recipeID: IRecipe["id"],
  stepID: IStep["id"]
) => {
  dispatch(deleteStep.request({ recipeID, stepID }))
  return api
    .deleteStep(recipeID, stepID)
    .then(() => {
      dispatch(deleteStep.success({ recipeID, stepID }))
    })
    .catch(() => {
      dispatch(deleteStep.failure({ recipeID, stepID }))
    })
}

export const logUserIn = (dispatch: Dispatch) => (
  email: string,
  password: string,
  redirectUrl: string = ""
) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingLogin(true))
  dispatch(setErrorLogin({}))
  dispatch(clearNotification())
  return api
    .loginUser(email, password)
    .then(res => {
      dispatch(login(res.data.user))
      dispatch(setLoadingLogin(false))
      dispatch(push(redirectUrl))
    })
    .catch((err: AxiosError) => {
      dispatch(setLoadingLogin(false))
      const badRequest = err.response && err.response.status === 400
      if (err.response && badRequest) {
        const data = err.response.data
        // tslint:disable:no-unsafe-any
        dispatch(
          setErrorLogin({
            email: data["email"],
            password1: data["password1"],
            nonFieldErrors: data["non_field_errors"]
          })
        )
        // tslint:enable:no-unsafe-any
      }
    })
}

export const socialLogin = (dispatch: Dispatch) => (
  service: SocialProvider,
  token: string,
  redirectUrl: string = ""
) => {
  return api
    .loginUserWithSocial(service, token)
    .then(res => {
      dispatch(login(res.data.user))
      dispatch(replace(redirectUrl))
    })
    .catch((err: AxiosError) => {
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
    })
}

export const socialConnect = (dispatch: Dispatch) => (
  service: SocialProvider,
  code: unknown
) => {
  return api
    .connectSocial(service, code)
    .then(() => {
      dispatch(replace("/settings"))
    })
    .catch(() => {
      dispatch(replace("/settings"))
    })
}

export const signup = (dispatch: Dispatch) => (
  email: string,
  password1: string,
  password2: string
) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingSignup(true))
  // clear previous signup errors
  dispatch(setErrorSignup({}))
  dispatch(clearNotification())
  return api
    .signup(email, password1, password2)
    .then(res => {
      dispatch(login(res.data.user))
      dispatch(setLoadingSignup(false))
      dispatch(push("/recipes/add"))
    })
    .catch((err: AxiosError) => {
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
    })
}
export const deletingRecipe = (dispatch: Dispatch) => (id: IRecipe["id"]) => {
  dispatch(deleteRecipe.request(id))
  return api
    .deleteRecipe(id)
    .then(() => {
      dispatch(push("/recipes"))
      dispatch(deleteRecipe.success(id))
    })
    .catch(() => {
      dispatch(deleteRecipe.failure(id))
    })
}

export const reset = (dispatch: Dispatch) => (email: string) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingReset(true))
  dispatch(setErrorReset({}))
  dispatch(clearNotification())
  return api
    .resetPassword(email)
    .then(res => {
      dispatch(setLoadingReset(false))
      const message = res && res.data && res.data.detail
      showNotificationWithTimeout(dispatch)({
        message,
        level: "success"
      })
    })
    .catch((err: AxiosError) => {
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
    })
}

export const resetConfirmation = (dispatch: Dispatch) => (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string
) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingResetConfirmation(true))
  dispatch(setErrorResetConfirmation({}))
  dispatch(clearNotification())
  return api
    .resetPasswordConfirm(uid, token, newPassword1, newPassword2)
    .then(res => {
      dispatch(setLoadingResetConfirmation(false))
      const message = res && res.data && res.data.detail
      showNotificationWithTimeout(dispatch)({
        message,
        level: "success"
      })
      dispatch(push("/login"))
    })
    .catch((err: AxiosError) => {
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
    })
}

export const fetchTeam = (dispatch: Dispatch) => (id: ITeam["id"]) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingTeam({ id, loadingTeam: true }))
  return api
    .getTeam(id)
    .then(res => {
      dispatch(addTeam(res.data))
      dispatch(setLoadingTeam({ id, loadingTeam: false }))
    })
    .catch((err: AxiosError) => {
      if (is404(err)) {
        dispatch(setTeam404({ id, val: true }))
      }
      dispatch(setLoadingTeam({ id, loadingTeam: false }))
    })
}

export const fetchTeamMembers = (dispatch: Dispatch) => (id: ITeam["id"]) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingTeamMembers({ id, loadingMembers: true }))
  return api
    .getTeamMembers(id)
    .then(res => {
      dispatch(setTeamMembers({ id, members: res.data }))
      dispatch(setLoadingTeamMembers({ id, loadingMembers: false }))
    })
    .catch(() => {
      dispatch(setLoadingTeamMembers({ id, loadingMembers: false }))
    })
}

export const fetchTeamRecipes = (dispatch: Dispatch) => (id: ITeam["id"]) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setLoadingTeamRecipes({ id, loadingRecipes: true }))
  return api
    .getTeamRecipes(id)
    .then(res => {
      dispatch(fetchRecipeList.success({ recipes: res.data, teamID: id }))
      dispatch(setTeamRecipes({ id, recipes: res.data }))
      dispatch(setLoadingTeamRecipes({ id, loadingRecipes: false }))
    })
    .catch(() => {
      dispatch(setLoadingTeamRecipes({ id, loadingRecipes: false }))
    })
}

// tslint:disable:no-unsafe-any
const attemptedDeleteLastAdmin = (res: AxiosResponse) =>
  res.status === 400 &&
  res.data.level &&
  res.data.level[0].includes("cannot demote")
// tslint:enable:no-unsafe-any

export const settingUserTeamLevel = (dispatch: Dispatch) => (
  teamID: ITeam["id"],
  membershipID: IMember["id"],
  level: IMember["level"]
) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setUpdatingUserTeamLevel({ id: teamID, updating: true }))
  return api
    .updateTeamMemberLevel(teamID, membershipID, level)
    .then(res => {
      dispatch(
        setUserTeamLevel({ teamID, membershipID, level: res.data.level })
      )
      dispatch(setUpdatingUserTeamLevel({ id: teamID, updating: false }))
    })
    .catch((err: AxiosError) => {
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
    })
}

export const deletingMembership = (dispatch: Dispatch) => (
  teamID: ITeam["id"],
  id: IMember["id"],
  leaving: boolean = false
) => {
  dispatch(setDeletingMembership({ teamID, membershipID: id, val: true }))
  return api
    .deleteTeamMember(teamID, id)
    .then(() => {
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
    })
    .catch((err: AxiosError) => {
      const message = err.response && err.response.data
      showNotificationWithTimeout(dispatch)({
        // tslint:disable-next-line:no-unsafe-any
        message,
        level: "danger",
        delay: 3 * second
      })
      dispatch(setDeletingMembership({ teamID, membershipID: id, val: false }))
    })
}

export const deletingTeam = (dispatch: Dispatch) => (teamID: ITeam["id"]) => {
  return api
    .deleteTeam(teamID)
    .then(() => {
      dispatch(push("/"))
      const teamName = store.getState().teams.byId[teamID].name
      showNotificationWithTimeout(dispatch)({
        message: `Team deleted (${teamName})`,
        level: "success",
        delay: 3 * second
      })
      dispatch(deleteTeam(teamID))
    })
    .catch((err: AxiosError) => {
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
    })
}

export const sendingTeamInvites = (dispatch: Dispatch) => (
  teamID: ITeam["id"],
  emails: string[],
  level: IMember["level"]
) => {
  dispatch(setSendingTeamInvites({ teamID, val: true }))
  return api
    .sendTeamInvites(teamID, emails, level)
    .then(() => {
      showNotificationWithTimeout(dispatch)({
        message: "invites sent!",
        level: "success",
        delay: 3 * second
      })
      dispatch(setSendingTeamInvites({ teamID, val: false }))
    })
    .catch(() => {
      showNotificationWithTimeout(dispatch)({
        message: "error sending team invite",
        level: "danger",
        delay: 3 * second
      })
      dispatch(setSendingTeamInvites({ teamID, val: false }))
      // NOTE(chdsbd): We depend on this to return an error in TeamInvite.tsx
      return Error()
    })
}

export const fetchingTeams = (dispatch: Dispatch) => () => {
  dispatch(fetchTeams.request())
  return api
    .getTeamList()
    .then(res => {
      dispatch(fetchTeams.success(res.data))
    })
    .catch(() => {
      dispatch(fetchTeams.failure())
    })
}

export const creatingTeam = (dispatch: Dispatch) => (
  name: ITeam["name"],
  emails: string[],
  level: IMember["level"]
) => {
  dispatch(setCreatingTeam(true))
  return api
    .createTeam(name, emails, level)
    .then(res => {
      dispatch(setTeam({ id: res.data.id, team: res.data }))
      dispatch(setCreatingTeam(false))
      dispatch(push(`/t/${res.data.id}`))
    })
    .catch(() => {
      dispatch(setCreatingTeam(false))
    })
}

export const updatingTeam = (dispatch: Dispatch) => (
  teamId: ITeam["id"],
  teamKVs: unknown
) => {
  return api
    .updateTeam(teamId, teamKVs)
    .then(res => {
      showNotificationWithTimeout(dispatch)({
        message: "Team updated",
        level: "success",
        delay: 3 * second
      })
      dispatch(updateTeamById({ id: res.data.id, teamKeys: res.data }))
    })
    .catch((err: AxiosError) => {
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
    })
}

export const moveRecipeTo = (dispatch: Dispatch) => (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: unknown
) => {
  return api.moveRecipe(recipeId, ownerId, type).then(res => {
    dispatch(updateRecipeOwner({ id: res.data.id, owner: res.data.owner }))
  })
}

export const copyRecipeTo = (dispatch: Dispatch) => (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: unknown
) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setCopyingTeam(true))
  return api
    .copyRecipe(recipeId, ownerId, type)
    .then(res => {
      dispatch(fetchRecipe.success(res.data))
      dispatch(setCopyingTeam(false))
    })
    .catch(err => {
      dispatch(setCopyingTeam(false))
      // TODO(chdsbd): Improve api usage and remove this throw
      // tslint:disable-next-line:no-throw
      throw err
    })
}

export const fetchingInvites = (dispatch: Dispatch) => () => {
  dispatch(fetchInvites.request())
  return api
    .getInviteList()
    .then(res => {
      dispatch(fetchInvites.success(res.data))
    })
    .catch(() => {
      dispatch(fetchInvites.failure())
    })
}

export const acceptingInvite = (dispatch: Dispatch) => (id: IInvite["id"]) => {
  // TODO(sbdchd): refactor these to use createActionAsync()
  dispatch(setAcceptingInvite({ id, val: true }))
  return api
    .acceptInvite(id)
    .then(() => {
      dispatch(setAcceptingInvite({ id, val: false }))
      dispatch(setAcceptedInvite(id))
    })
    .catch(() => {
      dispatch(setAcceptingInvite({ id, val: false }))
    })
}
export const decliningInvite = (dispatch: Dispatch) => (id: IInvite["id"]) => {
  // TODO(sbdchd): refactor to use createActionAsync
  dispatch(setDecliningInvite({ id, val: true }))
  return api
    .declineInvite(id)
    .then(() => {
      dispatch(setDecliningInvite({ id, val: false }))
      dispatch(setDeclinedInvite(id))
    })
    .catch(() => {
      dispatch(setDecliningInvite({ id, val: false }))
    })
}

export const deleteUserAccount = (dispatch: Dispatch) => () => {
  return api
    .deleteLoggedInUser()
    .then(() => {
      dispatch(setUserLoggedIn(false))
      dispatch(push("/login"))
      showNotificationWithTimeout(dispatch)({ message: "Account deleted" })
    })
    .catch((error: AxiosError) => {
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
    })
}

export const reportBadMerge = (dispatch: Dispatch) => () => {
  return api
    .reportBadMerge()
    .then(() => {
      showNotificationWithTimeout(dispatch)({
        message: "reported bad merge",
        level: "success",
        delay: 3 * second
      })
    })
    .catch(() => {
      showNotificationWithTimeout(dispatch)({
        message: "error reporting bad merge",
        level: "danger",
        delay: 3 * second
      })
    })
}

export const fetchCalendar = (dispatch: Dispatch) => (
  teamID: TeamID,
  month = new Date()
) => {
  dispatch(fetchCalendarRecipes.request())
  // we fetch current month plus and minus 1 week
  return api
    .getCalendarRecipeList(teamID, month)
    .then(res => {
      dispatch(fetchCalendarRecipes.success(res.data))
    })
    .catch(() => {
      dispatch(fetchCalendarRecipes.failure())
    })
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
    user: recipe.owner.id
  }
}

export const addingScheduledRecipe = (dispatch: Dispatch) => (
  recipeID: IRecipe["id"],
  teamID: TeamID,
  on: Date,
  count: number
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
  return api
    .scheduleRecipe(recipeID, teamID, on, count)
    .then(res => {
      dispatch(replaceCalendarRecipe({ id: tempId, recipe: res.data }))
      dispatch(setSchedulingRecipe({ recipeID, scheduling: false }))
      const scheduledDate = new Date(res.data.on).toLocaleDateString()
      const recipeName = res.data.recipe.name
      const message = `${recipeName} scheduled on ${scheduledDate}`
      showNotificationWithTimeout(dispatch)({
        message,
        level: "success",
        delay: 3 * second
      })
    })
    .catch(() => {
      dispatch(deleteCalendarRecipe(tempId))
      showNotificationWithTimeout(dispatch)({
        message: "error scheduling recipe",
        level: "danger",
        delay: 3 * second
      })
      dispatch(setSchedulingRecipe({ recipeID, scheduling: false }))
    })
}
export const deletingScheduledRecipe = (dispatch: Dispatch) => (
  id: ICalRecipe["id"],
  teamID: TeamID
) => {
  // HACK(sbdchd): we should have these in byId object / Map
  // TODO(sbdchd): we can just have a marker for deleted recipes and just remove
  // that marker if this fails. Or we could put them in their own id list
  const recipe = store.getState().calendar.byId[id]
  dispatch(deleteCalendarRecipe(id))
  return api.deleteScheduledRecipe(id, teamID).catch(() => {
    dispatch(setCalendarRecipe(recipe))
  })
}

function isSameTeam(x: ICalRecipe, teamID: TeamID): boolean {
  if (teamID === "personal") {
    return x.user != null
  }
  return x.team === teamID
}

export const moveScheduledRecipe = (dispatch: Dispatch) => (
  id: ICalRecipe["id"],
  teamID: TeamID,
  to: Date
) => {
  // HACK(sbdchd): With an endpoint we can eliminate this
  const state = store.getState()
  const from = getCalRecipeById(state, id)
  const existing = getAllCalRecipes(state)
    .filter(x => isSameDay(x.on, to) && isSameTeam(x, teamID))
    .find(x => x.recipe.id === from.recipe.id)

  // Note(sbdchd): we need move to be after the checking of the store so we
  // don't delete the `from` recipe and update the `existing`
  dispatch(moveCalendarRecipe({ id, to: toDateString(to) }))

  if (existing) {
    // HACK(sbdchd): this should be an endpoint so we can have this be in a transaction
    return api
      .deleteScheduledRecipe(from.id, teamID)
      .then(() =>
        api.updateScheduleRecipe(existing.id, teamID, {
          count: existing.count + from.count
        })
      )
      .catch(() => {
        dispatch(moveCalendarRecipe({ id, to: toDateString(from.on) }))
      })
  }

  return api
    .updateScheduleRecipe(id, teamID, { on: toDateString(to) })
    .catch(() => {
      // on error we want to move it back to the old position
      dispatch(moveCalendarRecipe({ id, to: toDateString(from.on) }))
    })
}

export const updatingScheduledRecipe = (dispatch: Dispatch) => (
  id: ICalRecipe["id"],
  teamID: TeamID,
  count: ICalRecipe["count"]
) => {
  if (count <= 0) {
    return deletingScheduledRecipe(dispatch)(id, teamID)
  }

  return api.updateScheduleRecipe(id, teamID, { count }).then(res => {
    dispatch(setCalendarRecipe(res.data))
  })
}
