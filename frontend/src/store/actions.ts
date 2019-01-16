import isSameDay from "date-fns/is_same_day"

export type Dispatch = ReduxDispatch<Action>

export type GetState = () => RootState

import { random32Id } from "@/uuid"

import { toDateString } from "@/date"

import { push, replace } from "react-router-redux"
import { AxiosError, AxiosResponse } from "axios"
import raven from "raven-js"

import { store, RootState, Action } from "@/store/store"
import {
  SocialProvider,
  updateEmail,
  updateTeamID,
  fetchUser,
  setSocialConnections,
  login,
  setUserLoggedIn,
  setLoggingOut,
  IUser,
  ISocialConnection,
  fetchUserStats
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
  setRemovingStep,
  deleteStep,
  updateStep,
  setUpdatingStep,
  setRemovingIngredient,
  deleteIngredient,
  setUpdatingIngredient,
  setLoadingAddStepToRecipe,
  addStepToRecipe,
  setRecipeUpdating,
  setAddingIngredientToRecipe,
  addIngredientToRecipe,
  updateIngredient,
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
import {
  setLoadingPasswordUpdate,
  setErrorPasswordUpdate
} from "@/store/reducers/passwordChange"
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
  dispatch(setLoggingOut(true))
  return api
    .logoutUser()
    .then(() => {
      dispatch(setUserLoggedIn(false))
      dispatch(push("/login"))
      dispatch(setLoggingOut(false))
    })
    .catch(() => {
      dispatch(setLoggingOut(false))
    })
}

const emailExists = (err: AxiosError) =>
  // tslint:disable:no-unsafe-any
  err.response &&
  err.response.data.email != null &&
  err.response.data.email[0].includes("email already exists")
// tslint:enable:no-unsafe-any

const second = 1000

export const updatingEmail = (dispatch: Dispatch) => (email: string) => {
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

export const updatingTeamID = (dispatch: Dispatch) => (id: number | null) => {
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
  dispatch(setLoadingPasswordUpdate(true))
  dispatch(setErrorPasswordUpdate({}))
  return api
    .changePassword(password1, password2, oldPassword)
    .then(() => {
      dispatch(setLoadingPasswordUpdate(false))
      dispatch(push("/"))
      showNotificationWithTimeout(dispatch)({
        message: "Successfully updated password",
        level: "success"
      })
    })
    .catch((err: AxiosError) => {
      dispatch(setLoadingPasswordUpdate(false))
      const badRequest = err.response && err.response.status === 400
      if (err.response && badRequest) {
        const data = err.response.data
        // tslint:disable:no-unsafe-any
        dispatch(
          setErrorPasswordUpdate({
            newPasswordAgain: data["new_password2"],
            newPassword: data["new_password1"],
            oldPassword: data["old_password"]
          })
        )
        // tslint:ebale:no-unsafe-any
      }
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
  recipeID: number,
  ingredient: unknown
) => {
  dispatch(setAddingIngredientToRecipe(recipeID, true))
  return api
    .addIngredientToRecipe(recipeID, ingredient)
    .then(res => {
      dispatch(addIngredientToRecipe(recipeID, res.data))
      dispatch(setAddingIngredientToRecipe(recipeID, false))
    })
    .catch(() => {
      dispatch(setAddingIngredientToRecipe(recipeID, false))
    })
}

export const updateRecipe = (dispatch: Dispatch) => (
  id: number,
  data: unknown
) => {
  dispatch(setRecipeUpdating(id, true))
  return api
    .updateRecipe(id, data)
    .then(res => {
      // TODO(sbdchd): this should have its own actions
      dispatch(fetchRecipe.success(res.data))
      dispatch(setRecipeUpdating(id, false))
    })
    .catch(() => {
      dispatch(setRecipeUpdating(id, false))
    })
}

export const addingRecipeStep = (dispatch: Dispatch) => (
  recipeID: number,
  step: unknown
) => {
  dispatch(setLoadingAddStepToRecipe(recipeID, true))
  return api
    .addStepToRecipe(recipeID, step)
    .then(res => {
      dispatch(addStepToRecipe(recipeID, res.data))
      dispatch(setLoadingAddStepToRecipe(recipeID, false))
    })
    .catch(() => {
      dispatch(setLoadingAddStepToRecipe(recipeID, false))
    })
}

export const updatingIngredient = (dispatch: Dispatch) => (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"],
  content: unknown
) => {
  dispatch(setUpdatingIngredient(recipeID, ingredientID, true))
  return api
    .updateIngredient(recipeID, ingredientID, content)
    .then(res => {
      dispatch(updateIngredient(recipeID, ingredientID, res.data))
      dispatch(setUpdatingIngredient(recipeID, ingredientID, false))
    })
    .catch(() => {
      dispatch(setUpdatingIngredient(recipeID, ingredientID, false))
    })
}

export const deletingIngredient = (dispatch: Dispatch) => (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"]
) => {
  dispatch(setRemovingIngredient(recipeID, ingredientID, true))
  return api
    .deleteIngredient(recipeID, ingredientID)
    .then(() => {
      dispatch(setRemovingIngredient(recipeID, ingredientID, false))
      dispatch(deleteIngredient(recipeID, ingredientID))
    })
    .catch(() => {
      dispatch(setRemovingIngredient(recipeID, ingredientID, false))
    })
}

export const updatingStep = (dispatch: Dispatch) => (
  recipeID: number,
  stepID: number,
  { text, position }: { text?: string; position?: number }
) => {
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
  return api
    .updateStep(recipeID, stepID, data)
    .then(res => {
      const txt = res.data.text
      const pos = res.data.position
      dispatch(updateStep(recipeID, stepID, txt, pos))
      dispatch(setUpdatingStep(recipeID, stepID, false))
    })
    .catch(() => {
      dispatch(setUpdatingStep(recipeID, stepID, false))
    })
}

export const deletingStep = (dispatch: Dispatch) => (
  recipeID: IRecipe["id"],
  stepID: IStep["id"]
) => {
  dispatch(setRemovingStep(recipeID, stepID, true))
  return api
    .deleteStep(recipeID, stepID)
    .then(() => {
      dispatch(deleteStep(recipeID, stepID))
      dispatch(setRemovingStep(recipeID, stepID, false))
    })
    .catch(() => {
      dispatch(setRemovingStep(recipeID, stepID, false))
    })
}

export const logUserIn = (dispatch: Dispatch) => (
  email: string,
  password: string,
  redirectUrl: string = ""
) => {
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
  dispatch(setLoadingTeam(id, true))
  return api
    .getTeam(id)
    .then(res => {
      dispatch(addTeam(res.data))
      dispatch(setLoadingTeam(id, false))
    })
    .catch((err: AxiosError) => {
      if (is404(err)) {
        dispatch(setTeam404(id))
      }
      dispatch(setLoadingTeam(id, false))
    })
}

export const fetchTeamMembers = (dispatch: Dispatch) => (id: ITeam["id"]) => {
  dispatch(setLoadingTeamMembers(id, true))
  return api
    .getTeamMembers(id)
    .then(res => {
      dispatch(setTeamMembers(id, res.data))
      dispatch(setLoadingTeamMembers(id, false))
    })
    .catch(() => {
      dispatch(setLoadingTeamMembers(id, false))
    })
}

export const fetchTeamRecipes = (dispatch: Dispatch) => (id: number) => {
  // TODO(sbdchd): this needs its own actions
  dispatch(setLoadingTeamRecipes(id, true))
  return api
    .getTeamRecipes(id)
    .then(res => {
      dispatch(fetchRecipeList.success({ recipes: res.data, teamID: id }))
      dispatch(setTeamRecipes(id, res.data))
      dispatch(setLoadingTeamRecipes(id, false))
    })
    .catch(() => {
      dispatch(setLoadingTeamRecipes(id, false))
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
  dispatch(setUpdatingUserTeamLevel(teamID, true))
  return api
    .updateTeamMemberLevel(teamID, membershipID, level)
    .then(res => {
      dispatch(setUserTeamLevel(teamID, membershipID, res.data.level))
      dispatch(setUpdatingUserTeamLevel(teamID, false))
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
      dispatch(setUpdatingUserTeamLevel(teamID, false))
    })
}

export const deletingMembership = (dispatch: Dispatch) => (
  teamID: ITeam["id"],
  id: IMember["id"],
  leaving: boolean = false
) => {
  dispatch(setDeletingMembership(teamID, id, true))
  return api
    .deleteTeamMember(teamID, id)
    .then(() => {
      const message = "left team " + store.getState().teams.byId[teamID].name
      dispatch(deleteMembership(teamID, id))
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
      dispatch(setDeletingMembership(teamID, id, false))
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
  dispatch(setSendingTeamInvites(teamID, true))
  return api
    .sendTeamInvites(teamID, emails, level)
    .then(() => {
      showNotificationWithTimeout(dispatch)({
        message: "invites sent!",
        level: "success",
        delay: 3 * second
      })
      dispatch(setSendingTeamInvites(teamID, false))
    })
    .catch(() => {
      showNotificationWithTimeout(dispatch)({
        message: "error sending team invite",
        level: "danger",
        delay: 3 * second
      })
      dispatch(setSendingTeamInvites(teamID, false))
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
  name: string,
  emails: string[],
  level: IMember["level"]
) => {
  dispatch(setCreatingTeam(true))
  return api
    .createTeam(name, emails, level)
    .then(res => {
      dispatch(setTeam(res.data.id, res.data))
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
      dispatch(updateTeamById(res.data.id, res.data))
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
    dispatch(updateRecipeOwner(res.data.id, res.data.owner))
  })
}

export const copyRecipeTo = (dispatch: Dispatch) => (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: unknown
) => {
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
  dispatch(setAcceptingInvite(id, true))
  return api
    .acceptInvite(id)
    .then(() => {
      dispatch(setAcceptingInvite(id, false))
      dispatch(setAcceptedInvite(id))
    })
    .catch(() => {
      dispatch(setAcceptingInvite(id, false))
    })
}
export const decliningInvite = (dispatch: Dispatch) => (id: IInvite["id"]) => {
  dispatch(setDecliningInvite(id, true))
  return api
    .declineInvite(id)
    .then(() => {
      dispatch(setDecliningInvite(id, false))
      dispatch(setDeclinedInvite(id))
    })
    .catch(() => {
      dispatch(setDecliningInvite(id, false))
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
  dispatch(setSchedulingRecipe(recipeID, true))
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
      dispatch(replaceCalendarRecipe(tempId, res.data))
      dispatch(setSchedulingRecipe(recipeID, false))
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
      dispatch(setSchedulingRecipe(recipeID, false))
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
  dispatch(moveCalendarRecipe(id, toDateString(to)))

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
        dispatch(moveCalendarRecipe(id, toDateString(from.on)))
      })
  }

  return api
    .updateScheduleRecipe(id, teamID, { on: toDateString(to) })
    .catch(() => {
      // on error we want to move it back to the old position
      dispatch(moveCalendarRecipe(id, toDateString(from.on)))
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
