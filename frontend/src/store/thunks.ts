import { AxiosError, AxiosResponse } from "axios"
import { push } from "connected-react-router"
import { addWeeks, endOfWeek, parseISO, startOfWeek, subWeeks } from "date-fns"
import { isRight } from "fp-ts/lib/Either"
import { pickBy } from "lodash-es"
import raven from "raven-js"
// eslint-disable-next-line no-restricted-imports
import { Dispatch as ReduxDispatch } from "redux"

import * as api from "@/api"
import { heldKeys } from "@/components/CurrentKeys"
import { isInsideChangeWindow, second, toISODateString } from "@/date"
import { IRecipeBasic } from "@/pages/recipe-detail/RecipeTitle"
import { Err, isErr, isOk, Ok, Result } from "@/result"
import { clearAddRecipeForm } from "@/store/reducers/addrecipe"
import {
  login,
  setErrorReset,
  setErrorResetConfirmation,
  setErrorSignup,
  setLoadingReset,
  setLoadingResetConfirmation,
  setLoadingSignup,
} from "@/store/reducers/auth"
import {
  deleteCalendarRecipe,
  fetchCalendarRecipes,
  getExistingRecipe,
  ICalRecipe,
  moveCalendarRecipe,
  replaceCalendarRecipe,
  setCalendarRecipe,
} from "@/store/reducers/calendar"
import {
  acceptInvite,
  declineInvite,
  fetchInvites,
  IInvite,
} from "@/store/reducers/invites"
import {
  clearNotification,
  INotificationState,
  setNotification,
} from "@/store/reducers/notification"
import { passwordUpdate } from "@/store/reducers/passwordChange"
import {
  createRecipe,
  deleteIngredient,
  deleteStep,
  fetchRecipe,
  fetchRecipeList,
  IIngredient,
  IRecipe,
  IStep,
  setSchedulingRecipe,
  updateRecipeOwner,
  updateStep,
} from "@/store/reducers/recipes"
import { fetchShoppingList } from "@/store/reducers/shoppinglist"
import {
  deleteMembership,
  deleteTeam,
  fetchTeam,
  fetchTeamMembers,
  fetchTeams,
  IMember,
  ITeam,
  setCopyingTeam,
  setCreatingTeam,
  setDeletingMembership,
  setSendingTeamInvites,
  setTeam,
  setUpdatingUserTeamLevel,
  setUserTeamLevel,
  updateTeamById,
} from "@/store/reducers/teams"
import {
  fetchSessions,
  fetchUser,
  ISession,
  IUser,
  IUserState,
  logOut,
  logoutAllSessions,
  logoutSessionById,
  setUserLoggedIn,
  updateEmail,
  updateRecipeTeamID,
  updateScheduleTeamID,
} from "@/store/reducers/user"
import { Action, IState, store } from "@/store/store"
import { recipeURL } from "@/urls"
import { random32Id } from "@/uuid"
import { isSuccessOrRefetching } from "@/webdata"

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
let notificationTimeout: number | NodeJS.Timer = 0
export const showNotificationWithTimeoutAsync =
  (dispatch: Dispatch) =>
  ({
    message,
    level = "info",
    closeable = true,
    delay = 2000,
    sticky = false,
  }: INotificationWithTimeout) => {
    clearTimeout(notificationTimeout)
    dispatch(
      setNotification({
        message,
        level,
        closeable,
      }),
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  err.response?.data.email?.[0].includes("email already exists")

export const updatingEmailAsync =
  (dispatch: Dispatch) => async (email: IUser["email"]) => {
    dispatch(updateEmail.request())
    const res = await api.updateUser({ email })

    if (isOk(res)) {
      dispatch(updateEmail.success(res.data))

      showNotificationWithTimeoutAsync(dispatch)({
        message: "updated email",
        level: "success",
        delay: 3 * second,
      })
    } else {
      dispatch(updateEmail.failure())
      const messageExtra = emailExists(res.error)
        ? "- email already in use"
        : ""
      dispatch(
        setNotification({
          message: `problem updating email ${messageExtra}`,
          level: "danger",
        }),
      )
    }
  }

export const updatingDefaultRecipeTeamID =
  (dispatch: Dispatch) => async (id: IUserState["recipeTeamID"]) => {
    // store old id so we can undo
    const oldID = store.getState().user.recipeTeamID
    dispatch(updateRecipeTeamID(id))
    const res = await api.updateUser({ selected_team: id })
    if (isOk(res)) {
      dispatch(fetchUser.success(res.data))
    } else {
      dispatch(updateRecipeTeamID(oldID))
    }
  }

export const updatingDefaultScheduleTeamIDAsync =
  (dispatch: Dispatch) => async (id: IUserState["scheduleTeamID"]) => {
    // store old id so we can undo
    const oldID = store.getState().user.scheduleTeamID
    dispatch(updateScheduleTeamID(id))
    const res = await api.updateUser({ schedule_team: id })
    if (isOk(res)) {
      dispatch(fetchUser.success(res.data))
    } else {
      dispatch(updateScheduleTeamID(oldID))
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

export const loggingOutSessionByIdAsync =
  (dispatch: Dispatch) => async (id: ISession["id"]) => {
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

interface IUpdatePassword {
  password1: string
  password2: string
  oldPassword: string
}
export const updatingPasswordAsync =
  (dispatch: Dispatch) =>
  async ({ password1, password2, oldPassword }: IUpdatePassword) => {
    dispatch(passwordUpdate.request())
    const res = await api.changePassword(password1, password2, oldPassword)
    if (isOk(res)) {
      dispatch(passwordUpdate.success())
      dispatch(push("/"))
      showNotificationWithTimeoutAsync(dispatch)({
        message: "Successfully updated password",
        level: "success",
      })
    } else {
      const err = res.error
      const badRequest = err.response && err.response.status === 400
      if (err.response && badRequest) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: {
          new_password2?: string[]
          new_password1?: string[]
          old_password?: string[]
        } = err.response.data

        dispatch(
          passwordUpdate.failure({
            newPasswordAgain: data["new_password2"],
            newPassword: data["new_password1"],
            oldPassword: data["old_password"],
          }),
        )
        return
      }
      dispatch(passwordUpdate.failure())
    }
  }

export const fetchingShoppingListAsync =
  (dispatch: Dispatch) => async (teamID: number | "personal") => {
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

export const postNewRecipeAsync =
  (dispatch: Dispatch) => async (recipe: IRecipeBasic) => {
    dispatch(createRecipe.request())
    const res = await api.createRecipe(recipe)
    if (isOk(res)) {
      dispatch(createRecipe.success(res.data))
      dispatch(push(recipeURL(res.data.id)))
      dispatch(clearAddRecipeForm())
    } else {
      const err = res.error

      const errors =
        (err.response && {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          errorWithName: err.response.data.name != null,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          errorWithIngredients: err.response.data.ingredients != null,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          errorWithSteps: err.response.data.steps != null,
        }) ||
        {}

      dispatch(createRecipe.failure(errors))
      showNotificationWithTimeoutAsync(dispatch)({
        message: "problem creating new recipe",
        level: "danger",
        delay: 5 * second,
      })
    }
  }

export const fetchingRecipeListAsync = (dispatch: Dispatch) => async () => {
  dispatch(fetchRecipeList.request())
  const res = await api.getRecipeList()
  if (isOk(res)) {
    dispatch(fetchRecipeList.success({ recipes: res.data }))
  } else {
    dispatch(fetchRecipeList.failure())
  }
}

interface IDeletingIngredientAsyncPayload {
  readonly recipeID: IRecipe["id"]
  readonly ingredientID: IIngredient["id"]
}

export async function deletingIngredientAsync(
  { recipeID, ingredientID }: IDeletingIngredientAsyncPayload,
  dispatch: Dispatch,
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
  dispatch: Dispatch,
) => {
  const res = await api.updateStep(
    recipeID,
    stepID,
    pickBy(data, (x) => x != null),
  )
  if (isOk(res)) {
    dispatch(
      updateStep.success({
        recipeID,
        stepID,
        text: res.data.text,
        position: res.data.position,
      }),
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
  dispatch: Dispatch,
) => {
  const res = await api.deleteStep(recipeID, stepID)
  if (isOk(res)) {
    dispatch(deleteStep.success({ recipeID, stepID }))
  } else {
    dispatch(deleteStep.failure({ recipeID, stepID }))
  }
}

export const logUserInAsync =
  (dispatch: Dispatch) =>
  async (email: string, password: string, redirectUrl: string = "") => {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: {
          email?: string[]
          password1?: string[]
          non_field_errors?: string[]
        } = err.response.data

        dispatch(
          login.failure({
            email: data["email"],
            password1: data["password1"],
            nonFieldErrors: data["non_field_errors"],
          }),
        )

        return
      }
      dispatch(login.failure())
    }
  }

export const signupAsync =
  (dispatch: Dispatch) =>
  async (email: string, password1: string, password2: string) => {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: {
          email?: string[]
          password1?: string[]
          password2?: string[]
          non_field_errors?: string[]
        } = err.response?.data
        dispatch(
          setErrorSignup({
            email: data["email"],
            password1: data["password1"],
            password2: data["password2"],
            nonFieldErrors: data["non_field_errors"],
          }),
        )
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
    const message = res?.data?.detail
    showNotificationWithTimeoutAsync(dispatch)({
      message,
      level: "success",
    })
  } else {
    const err = res.error
    dispatch(setLoadingReset(false))
    showNotificationWithTimeoutAsync(dispatch)({
      message: "uh oh! problem resetting password",
      level: "danger",
      sticky: true,
    })
    if (isbadRequest(err)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: { email: string[]; non_field_errors?: string[] } =
        err.response?.data
      dispatch(
        setErrorReset({
          email: data["email"],
          nonFieldErrors: data["non_field_errors"],
        }),
      )
    }
    showNotificationWithTimeoutAsync(dispatch)({
      message: "problem resetting password",
      level: "danger",
      sticky: true,
    })
  }
}

export const resetConfirmationAsync =
  (dispatch: Dispatch) =>
  async (
    uid: string,
    token: string,
    newPassword1: string,
    newPassword2: string,
  ) => {
    // TODO(sbdchd): refactor to use createActionAsync
    dispatch(setLoadingResetConfirmation(true))
    dispatch(setErrorResetConfirmation({}))
    dispatch(clearNotification())

    const res = await api.resetPasswordConfirm(
      uid,
      token,
      newPassword1,
      newPassword2,
    )
    if (isOk(res)) {
      dispatch(setLoadingResetConfirmation(false))
      dispatch(login.success(res.data))
      dispatch(push("/"))
    } else {
      const err = res.error
      dispatch(setLoadingResetConfirmation(false))
      showNotificationWithTimeoutAsync(dispatch)({
        message: "uh oh! problem resetting password",
        level: "danger",
        sticky: true,
      })
      if (isbadRequest(err)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: {
          token?: string[]
          new_password1?: string[]
          new_password2?: string[]
          uid?: string[]
          non_field_errors?: string[]
        } = err.response?.data

        const tokenData =
          data["token"]?.map((x: unknown) => "token: " + String(x)) ?? []
        const uidData =
          data["uid"]?.map((x: unknown) => "uid: " + String(x)) ?? []
        const nonFieldErrors = (data["non_field_errors"] ?? [])
          .concat(tokenData)
          .concat(uidData)

        dispatch(
          setErrorResetConfirmation({
            newPassword1: data["new_password1"],
            newPassword2: data["new_password2"],
            nonFieldErrors,
          }),
        )
      }
    }
  }

export const fetchingTeamAsync =
  (dispatch: Dispatch) => async (id: ITeam["id"]) => {
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

export const fetchingTeamMembersAsync =
  (dispatch: Dispatch) => async (id: ITeam["id"]) => {
    dispatch(fetchTeamMembers.request(id))
    const res = await api.getTeamMembers(id)
    if (isOk(res)) {
      dispatch(fetchTeamMembers.success({ id, members: res.data }))
    } else {
      dispatch(fetchTeamMembers.failure(id))
    }
  }

const attemptedDeleteLastAdmin = (res: AxiosResponse) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  res.status === 400 &&
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  res.data.level?.[0].includes("cannot demote")

export const settingUserTeamLevelAsync =
  (dispatch: Dispatch) =>
  async (
    teamID: ITeam["id"],
    membershipID: IMember["id"],
    level: IMember["level"],
  ) => {
    // TODO(sbdchd): refactor to use createActionAsync
    dispatch(setUpdatingUserTeamLevel({ id: teamID, updating: true }))
    const res = await api.updateTeamMemberLevel(teamID, membershipID, level)
    if (isOk(res)) {
      dispatch(
        setUserTeamLevel({ teamID, membershipID, level: res.data.level }),
      )
      dispatch(setUpdatingUserTeamLevel({ id: teamID, updating: false }))
    } else {
      const err = res.error
      if (err.response && attemptedDeleteLastAdmin(err.response)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const message: string = err.response.data.level[0]
        showNotificationWithTimeoutAsync(dispatch)({
          message,
          level: "danger",
          delay: 3 * second,
        })
      }
      dispatch(setUpdatingUserTeamLevel({ id: teamID, updating: false }))
    }
  }

export const deletingMembershipAsync =
  (dispatch: Dispatch) =>
  async (teamID: ITeam["id"], id: IMember["id"], leaving: boolean = false) => {
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
          delay: 3 * second,
        })
        dispatch(deleteTeam(teamID))
      }
    } else {
      const err = res.error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message: string = err.response?.data
      showNotificationWithTimeoutAsync(dispatch)({
        message,
        level: "danger",
        delay: 3 * second,
      })
      dispatch(setDeletingMembership({ teamID, membershipID: id, val: false }))
    }
  }

export const deletingTeamAsync =
  (dispatch: Dispatch) => async (teamID: ITeam["id"]) => {
    const res = await api.deleteTeam(teamID)
    if (isOk(res)) {
      dispatch(push("/"))
      const team = store.getState().teams.byId[teamID]
      const teamName = team ? team.name : "unknown"
      showNotificationWithTimeoutAsync(dispatch)({
        message: `Team deleted (${teamName})`,
        level: "success",
        delay: 3 * second,
      })
      dispatch(deleteTeam(teamID))
    } else {
      const err = res.error
      let message = "Uh Oh! Something went wrong."

      if (err.response?.status === 403) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message = err.response.data?.detail
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            err.response.data.detail
          : "You are not authorized to delete this team"
      } else if (err.response?.status === 404) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message = err.response.data?.detail
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            err.response.data.detail
          : "The team you are attempting to delete doesn't exist"
      } else {
        raven.captureException(err)
      }

      showNotificationWithTimeoutAsync(dispatch)({
        message,
        level: "danger",
        delay: 3 * second,
      })
    }
  }

export const sendingTeamInvitesAsync =
  (dispatch: Dispatch) =>
  async (teamID: ITeam["id"], emails: string[], level: IMember["level"]) => {
    dispatch(setSendingTeamInvites({ teamID, val: true }))
    const res = await api.sendTeamInvites(teamID, emails, level)
    if (isOk(res)) {
      showNotificationWithTimeoutAsync(dispatch)({
        message: "invites sent!",
        level: "success",
        delay: 3 * second,
      })
      dispatch(setSendingTeamInvites({ teamID, val: false }))
      return Ok(undefined)
    }
    showNotificationWithTimeoutAsync(dispatch)({
      message: "error sending team invite",
      level: "danger",
      delay: 3 * second,
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

export const creatingTeamAsync =
  (dispatch: Dispatch) =>
  async (name: ITeam["name"], emails: string[], level: IMember["level"]) => {
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

export const updatingTeamAsync =
  (dispatch: Dispatch) => async (teamId: ITeam["id"], teamKVs: unknown) => {
    const res = await api.updateTeam(teamId, teamKVs)
    if (isOk(res)) {
      showNotificationWithTimeoutAsync(dispatch)({
        message: "Team updated",
        level: "success",
        delay: 3 * second,
      })
      dispatch(updateTeamById({ id: res.data.id, teamKeys: res.data }))
    } else {
      const err = res.error
      let message = "Problem updating team."

      if (err.response && err.response.status === 403) {
        message = "You are not authorized to perform that action"
      }
      showNotificationWithTimeoutAsync(dispatch)({
        message,
        level: "danger",
        delay: 3 * second,
      })
    }
  }

export const moveRecipeToAsync =
  (dispatch: Dispatch) =>
  async (
    recipeId: IRecipe["id"],
    ownerId: IUser["id"],
    type: IRecipe["owner"]["type"],
  ) => {
    const res = await api.moveRecipe(recipeId, ownerId, type)
    if (isOk(res)) {
      dispatch(updateRecipeOwner({ id: res.data.id, owner: res.data.owner }))
      return Ok(undefined)
    }
    return Err(undefined)
  }

export const copyRecipeToAsync =
  (dispatch: Dispatch) =>
  async (
    recipeId: IRecipe["id"],
    ownerId: IUser["id"],
    type: IRecipe["owner"]["type"],
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

      showNotificationWithTimeoutAsync(dispatch)({
        message: `Problem copying recipe: ${res.error}`,
        level: "danger",
        sticky: true,
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

export const acceptingInviteAsync =
  (dispatch: Dispatch) => async (id: IInvite["id"]) => {
    dispatch(acceptInvite.request(id))
    const res = await api.acceptInvite(id)
    if (isOk(res)) {
      dispatch(acceptInvite.success(id))
    } else {
      dispatch(acceptInvite.failure(id))
    }
  }
export const decliningInviteAsync =
  (dispatch: Dispatch) => async (id: IInvite["id"]) => {
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

    if (
      error.response &&
      error.response.status === 403 &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      error.response.data.detail
    ) {
      showNotificationWithTimeoutAsync(dispatch)({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.response.data.detail,
        level: "danger",
      })
    } else {
      showNotificationWithTimeoutAsync(dispatch)({
        message: "failed to delete account",
        level: "danger",
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
      delay: 3 * second,
    })
  } else {
    showNotificationWithTimeoutAsync(dispatch)({
      message: "error reporting bad merge",
      level: "danger",
      delay: 3 * second,
    })
  }
}

export const fetchCalendarAsync =
  (dispatch: Dispatch) =>
  async (teamID: number | "personal", currentDayTs: number) => {
    dispatch(fetchCalendarRecipes.request())
    // we fetch current month plus and minus 1 week
    const start = startOfWeek(subWeeks(currentDayTs, 3))
    const end = endOfWeek(addWeeks(currentDayTs, 3))
    const res = await api.getCalendarRecipeList({ teamID, start, end })
    if (isRight(res)) {
      dispatch(
        fetchCalendarRecipes.success({
          scheduledRecipes: res.right.scheduledRecipes,
          start: toISODateString(start),
          end: toISODateString(end),
          settings: res.right.settings,
        }),
      )
    } else {
      dispatch(fetchCalendarRecipes.failure())
    }
  }

export function toCalRecipe(
  recipe: IRecipe,
  tempId: ICalRecipe["id"],
  on: ICalRecipe["on"],
  count: ICalRecipe["count"],
): ICalRecipe {
  return {
    id: tempId,
    created: String(new Date()),
    recipe: {
      id: recipe.id,
      name: recipe.name,
    },
    on: toISODateString(on),
    count,
    user: recipe.owner.type === "user" ? recipe.owner.id : null,
    team: recipe.owner.type === "team" ? recipe.owner.id : null,
  }
}

export interface IAddingScheduledRecipeProps {
  readonly recipeID: IRecipe["id"]
  readonly teamID: number | "personal"
  readonly on: Date
  readonly count: number
  readonly showNotification?: boolean
}

export const addingScheduledRecipeAsync = async (
  dispatch: Dispatch,
  getState: () => IState,
  {
    recipeID,
    teamID,
    on,
    count,
    showNotification,
  }: IAddingScheduledRecipeProps,
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
    setCalendarRecipe(
      toCalRecipe(recipe.data, tempId, toISODateString(on), count),
    ),
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
        delay: 3 * second,
      })
    }
  } else {
    dispatch(deleteCalendarRecipe(tempId))
    showNotificationWithTimeoutAsync(dispatch)({
      message: "error scheduling recipe",
      level: "danger",
      delay: 3 * second,
    })
    dispatch(setSchedulingRecipe({ recipeID, scheduling: false }))
  }
}
export const deletingScheduledRecipeAsync =
  (dispatch: Dispatch) =>
  async (id: ICalRecipe["id"], teamID: number | "personal") => {
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
  readonly teamID: number | "personal"
  readonly to: Date
}

export const moveScheduledRecipe = async (
  dispatch: Dispatch,
  getState: () => IState,
  { id, teamID, to }: IMoveScheduledRecipeProps,
) => {
  // HACK(sbdchd): With an endpoint we can eliminate this
  const state = getState()
  const from = state.calendar.byId[id]

  if (from == null) {
    return
  }

  // copy recipe if
  // - recipe from the past
  // - user is holding shift
  const holdingShift = heldKeys.size === 1 && heldKeys.has("Shift")
  const copyRecipe = !isInsideChangeWindow(parseISO(from.on)) || holdingShift
  if (copyRecipe) {
    return addingScheduledRecipeAsync(dispatch, getState, {
      recipeID: from.recipe.id,
      teamID,
      on: to,
      count: from.count,
    })
  }
  const existing = getExistingRecipe({ state: state.calendar, on: to, from })

  // Note(sbdchd): we need move to be after the checking of the store so we
  // don't delete the `from` recipe and update the `existing`
  dispatch(moveCalendarRecipe({ id, to: toISODateString(to) }))

  if (existing) {
    // HACK(sbdchd): this should be an endpoint so we can have this be in a transaction
    const resp = await api.deleteScheduledRecipe(from.id, teamID)
    if (isOk(resp)) {
      void api.updateScheduleRecipe(existing.id, teamID, {
        count: existing.count + from.count,
      })
    } else {
      dispatch(moveCalendarRecipe({ id, to: toISODateString(from.on) }))
    }
  }

  const res = await api.updateScheduleRecipe(id, teamID, {
    on: toISODateString(to),
  })
  if (isErr(res)) {
    // on error we want to move it back to the old position
    dispatch(moveCalendarRecipe({ id, to: toISODateString(from.on) }))
  }
}

export const updatingScheduledRecipeAsync =
  (dispatch: Dispatch) =>
  async (
    id: ICalRecipe["id"],
    teamID: number | "personal",
    count: ICalRecipe["count"],
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
