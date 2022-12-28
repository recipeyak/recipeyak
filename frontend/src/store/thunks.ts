import { AxiosError, AxiosResponse } from "axios"
import { push } from "connected-react-router"
import raven from "raven-js"
// eslint-disable-next-line no-restricted-imports
import { Dispatch as ReduxDispatch } from "redux"

import * as api from "@/api"
import { Err, isOk, Ok } from "@/result"
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
  cacheUserInfo,
  IUserState,
  updateScheduleTeamID,
} from "@/store/reducers/user"
import { Action, store } from "@/store/store"
import { toast } from "@/toast"

// TODO(sbdchd): move to @/store/store
export type Dispatch = ReduxDispatch<Action>

const is404 = (err: AxiosError) => err.response && err.response.status === 404

export const updatingDefaultScheduleTeamIDAsync =
  (dispatch: Dispatch) => async (id: IUserState["scheduleTeamID"]) => {
    // store old id so we can undo
    const oldID = store.getState().user.scheduleTeamID
    dispatch(updateScheduleTeamID(id))
    const res = await api.updateUser({ schedule_team: id })
    if (isOk(res)) {
      dispatch(cacheUserInfo(res.data))
    } else {
      dispatch(updateScheduleTeamID(oldID))
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
