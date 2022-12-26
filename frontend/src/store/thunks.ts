import { AxiosError, AxiosResponse } from "axios"
import { push } from "connected-react-router"
import raven from "raven-js"
// eslint-disable-next-line no-restricted-imports
import { Dispatch as ReduxDispatch } from "redux"

import * as api from "@/api"
import { Err, isOk, Ok } from "@/result"
import {
  setErrorReset,
  setErrorResetConfirmation,
  setErrorSignup,
  setLoadingReset,
  setLoadingResetConfirmation,
  setLoadingSignup,
} from "@/store/reducers/auth"
import { passwordUpdate } from "@/store/reducers/passwordChange"
import {
  deleteIngredient,
  deleteStep,
  fetchRecipeList,
  IIngredient,
  IRecipe,
  IStep,
  updateStep,
} from "@/store/reducers/recipes"
import {
  deleteMembership,
  deleteTeam,
  fetchTeam,
  fetchTeamMembers,
  IMember,
  ITeam,
  setCreatingTeam,
  setDeletingMembership,
  setSendingTeamInvites,
  setTeam,
  setUpdatingUserTeamLevel,
  setUserTeamLevel,
  updateTeamById,
} from "@/store/reducers/teams"
import {
  fetchUser,
  IUser,
  IUserState,
  setUserLoggedIn,
  updateEmail,
  updateScheduleTeamID,
} from "@/store/reducers/user"
import { Action, store } from "@/store/store"
import { toast } from "@/toast"

// TODO(sbdchd): move to @/store/store
export type Dispatch = ReduxDispatch<Action>

const isbadRequest = (err: AxiosError) =>
  err.response && err.response.status === 400

const is404 = (err: AxiosError) => err.response && err.response.status === 404

const emailExists = (err: AxiosError) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  err.response?.data.email?.[0].includes("email already exists")

export const updatingEmailAsync =
  (dispatch: Dispatch) => async (email: IUser["email"]) => {
    dispatch(updateEmail.request())
    const res = await api.updateUser({ email })

    if (isOk(res)) {
      dispatch(updateEmail.success(res.data))
      toast.success("updated email")
    } else {
      dispatch(updateEmail.failure())
      const messageExtra = emailExists(res.error)
        ? "- email already in use"
        : ""
      toast.error(`problem updating email ${messageExtra}`)
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
      toast.success("Successfully updated password")
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
  readonly position?: string
}

export const updatingStepAsync = async (
  { recipeID, stepID, ...data }: IUpdatingStepPayload,
  dispatch: Dispatch,
) => {
  const res = await api.updateStep(recipeID, stepID, data)
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

export const signupAsync =
  (dispatch: Dispatch) =>
  async (email: string, password1: string, password2: string) => {
    // TODO(sbdchd): refactor to use createActionAsync
    dispatch(setLoadingSignup(true))
    // clear previous signup errors
    dispatch(setErrorSignup({}))
    toast.dismiss()

    const res = await api.signup(email, password1, password2)

    if (isOk(res)) {
      dispatch(fetchUser.success(res.data.user))
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
  toast.dismiss()
  const res = await api.resetPassword(email)
  if (isOk(res)) {
    dispatch(setLoadingReset(false))
    const message = res?.data?.detail
    toast.success(message)
  } else {
    const err = res.error
    dispatch(setLoadingReset(false))
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
    toast.error("problem resetting password")
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
    toast.dismiss()

    const res = await api.resetPasswordConfirm(
      uid,
      token,
      newPassword1,
      newPassword2,
    )
    if (isOk(res)) {
      dispatch(setLoadingResetConfirmation(false))
      dispatch(fetchUser.success(res.data))
      dispatch(push("/"))
    } else {
      const err = res.error
      dispatch(setLoadingResetConfirmation(false))
      toast.error("uh oh! problem resetting password")
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
        toast.error(message)
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
        toast.success(message)
        dispatch(deleteTeam(teamID))
      }
    } else {
      const err = res.error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message: string = err.response?.data
      toast.error(message)
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
      toast.success(`Team deleted (${teamName})`)
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

      toast.error(message)
    }
  }

export const sendingTeamInvitesAsync =
  (dispatch: Dispatch) =>
  async (teamID: ITeam["id"], emails: string[], level: IMember["level"]) => {
    dispatch(setSendingTeamInvites({ teamID, val: true }))
    const res = await api.sendTeamInvites(teamID, emails, level)
    if (isOk(res)) {
      toast.success("invites sent!")
      dispatch(setSendingTeamInvites({ teamID, val: false }))
      return Ok(undefined)
    }
    toast.error("error sending team invite")
    dispatch(setSendingTeamInvites({ teamID, val: false }))
    return Err(undefined)
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
      toast.success("Team updated")
      dispatch(updateTeamById({ id: res.data.id, teamKeys: res.data }))
    } else {
      const err = res.error
      let message = "Problem updating team."

      if (err.response && err.response.status === 403) {
        message = "You are not authorized to perform that action"
      }
      toast.error(message)
    }
  }

export const deleteUserAccountAsync = (dispatch: Dispatch) => async () => {
  const res = await api.deleteLoggedInUser()
  if (isOk(res)) {
    dispatch(setUserLoggedIn(false))
    dispatch(push("/login"))
    toast("Account deleted")
  } else {
    const error = res.error

    if (
      error.response &&
      error.response.status === 403 &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      error.response.data.detail
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.response.data.detail)
    } else {
      toast.error("failed to delete account")
    }
  }
}
