import { uniq, omit } from "lodash"

import { IUser } from "@/store/reducers/user"
import {
  action as act,
  createAsyncAction,
  getType,
  ActionType
} from "typesafe-actions"
import { IRecipe } from "@/store/reducers/recipes"

const ADD_TEAM = "ADD_TEAM"
const DELETE_TEAM = "DELETE_TEAM"
const SET_LOADING_TEAM = "SET_LOADING_TEAM"
const SET_LOADING_TEAM_MEMBERS = "SET_LOADING_TEAM_MEMBERS"
const SET_LOADING_TEAM_RECIPES = "SET_LOADING_TEAM_RECIPES"
const SET_TEAM_404 = "SET_TEAM_404"
const SET_TEAM_MEMBERS = "SET_TEAM_MEMBERS"
const SET_TEAM_RECIPES = "SET_TEAM_RECIPES"
const SET_UPDATING_USER_TEAM_LEVEL = "SET_UPDATING_USER_TEAM_LEVEL"
const SET_DELETING_MEMBERSHIP = "SET_DELETING_MEMBERSHIP"
const SET_USER_TEAM_LEVEL = "SET_USER_TEAM_LEVEL"
const SET_SENDING_TEAM_INVITES = "SET_SENDING_TEAM_INVITES"
const DELETE_MEMBERSHIP = "DELETE_MEMBERSHIP"
const SET_TEAM = "SET_TEAM"
const SET_CREATING_TEAM = "SET_CREATING_TEAM"
const SET_COPYING_TEAM = "SET_COPYING_TEAM"
const UPDATE_TEAM = "UPDATE_TEAM"

export const addTeam = (team: ITeam) => act(ADD_TEAM, team)
export const deleteTeam = (id: number) => act(DELETE_TEAM, id)
export const setLoadingTeam = (id: number, loadingTeam: boolean) =>
  act(SET_LOADING_TEAM, {
    id,
    loadingTeam
  })
export const setLoadingTeamMembers = (id: number, loadingMembers: boolean) =>
  act(SET_LOADING_TEAM_MEMBERS, {
    id,
    loadingMembers
  })

export const setLoadingTeamRecipes = (id: number, loadingRecipes: boolean) =>
  act(SET_LOADING_TEAM_RECIPES, {
    id,
    loadingRecipes
  })
export const setTeam404 = (id: number, val = true) =>
  act(SET_TEAM_404, {
    id,
    val
  })

export const setTeamMembers = (id: number, members: IMember[]) =>
  act(SET_TEAM_MEMBERS, {
    id,
    members
  })

export const setTeamRecipes = (id: number, recipes: IRecipe[]) =>
  act(SET_TEAM_RECIPES, {
    id,
    recipes
  })

export const setUpdatingUserTeamLevel = (id: number, updating: boolean) =>
  act(SET_UPDATING_USER_TEAM_LEVEL, {
    id,
    updating
  })

export const setDeletingMembership = (
  teamID: number,
  membershipID: number,
  val: boolean
) =>
  act(SET_DELETING_MEMBERSHIP, {
    teamID,
    membershipID,
    val
  })

export const setUserTeamLevel = (
  teamID: number,
  membershipID: number,
  level: IMember["level"]
) =>
  act(SET_USER_TEAM_LEVEL, {
    teamID,
    membershipID,
    level
  })

export const setSendingTeamInvites = (teamID: number, val: boolean) =>
  act(SET_SENDING_TEAM_INVITES, {
    teamID,
    val
  })

export const deleteMembership = (teamID: number, membershipID: number) =>
  act(DELETE_MEMBERSHIP, {
    teamID,
    membershipID
  })

export const setTeam = (id: number, team: ITeam) =>
  act(SET_TEAM, {
    id,
    team
  })

export const setCreatingTeam = (val: boolean) => act(SET_CREATING_TEAM, val)

export const setCopyingTeam = (val: boolean) => act(SET_COPYING_TEAM, val)

export const updateTeamById = (id: number, teamKeys: ITeam) =>
  act(UPDATE_TEAM, {
    id,
    teamKeys
  })

export const fetchTeams = createAsyncAction(
  "FETCH_TEAMS_START",
  "FETCH_TEAMS_SUCCESS",
  "FETCH_TEAMS_FAILURE"
)<void, ITeam[], void>()

export type TeamsActions =
  | ReturnType<typeof addTeam>
  | ReturnType<typeof deleteTeam>
  | ReturnType<typeof setLoadingTeam>
  | ReturnType<typeof setLoadingTeamMembers>
  | ReturnType<typeof setLoadingTeamRecipes>
  | ReturnType<typeof setTeam404>
  | ReturnType<typeof setTeamMembers>
  | ReturnType<typeof setTeamRecipes>
  | ReturnType<typeof setUpdatingUserTeamLevel>
  | ReturnType<typeof setDeletingMembership>
  | ReturnType<typeof setUserTeamLevel>
  | ReturnType<typeof setSendingTeamInvites>
  | ReturnType<typeof deleteMembership>
  | ReturnType<typeof setTeam>
  | ReturnType<typeof setCreatingTeam>
  | ReturnType<typeof setCopyingTeam>
  | ReturnType<typeof updateTeamById>
  | ActionType<typeof fetchTeams>

// TODO(sbdchd): check if these optional fields are always used (aka, required)
export interface IMember {
  readonly id: number
  readonly user: IUser
  readonly level: "admin" | "contributor" | "read"
  readonly deleting?: boolean
  readonly is_active: boolean
}

export interface ITeam {
  readonly id: number
  readonly name: string
  readonly updating?: boolean
  readonly loadingRecipes?: boolean
  readonly sendingTeamInvites?: boolean
  readonly loadingTeam?: boolean
  readonly loadingMembers?: boolean
  readonly error404?: boolean
  readonly recipes?: number[]
  readonly members: {
    readonly [key: number]: IMember
  }
}

export interface ITeamsState {
  readonly allIds: number[]
  readonly loading?: boolean
  readonly creating?: boolean
  readonly copying?: boolean
  readonly moving?: boolean
  readonly byId: {
    readonly [key: number]: ITeam
  }
}

export function mapById<
  T extends { byId: { [key: number]: U } },
  U extends { id: number }
>(state: T, id: number, func: (team: U) => U): T {
  const team = state.byId[id]
  return {
    ...state,
    byId: {
      ...state.byId,
      [id]: func(team)
    }
  }
}

const initialState: ITeamsState = {
  byId: {},
  allIds: []
}

export const teams = (
  state: ITeamsState = initialState,
  action: TeamsActions
): ITeamsState => {
  switch (action.type) {
    case ADD_TEAM:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ...action.payload
          }
        },
        allIds: uniq([...state.allIds, action.payload.id])
      }
    case DELETE_TEAM:
      return {
        ...state,
        byId: omit(state.byId, action.payload),
        allIds: state.allIds.filter(id => id !== action.payload)
      }
    case SET_LOADING_TEAM:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            loadingTeam: action.payload.loadingTeam
          }
        }
      }
    case SET_LOADING_TEAM_MEMBERS:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            loadingMembers: action.payload.loadingMembers
          }
        }
      }
    case SET_LOADING_TEAM_RECIPES:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            loadingRecipes: action.payload.loadingRecipes
          }
        }
      }
    case SET_TEAM_404:
      return mapById(state, action.payload.id, team => ({
        ...team,
        error404: action.payload.val
      }))
    case SET_TEAM_MEMBERS:
      return mapById(state, action.payload.id, team => ({
        ...team,
        members: action.payload.members.reduce(
          (a, b) => ({
            ...a,
            [b.id]: b
          }),
          {}
        )
      }))
    case SET_TEAM_RECIPES:
      return mapById(state, action.payload.id, team => ({
        ...team,
        recipes: action.payload.recipes.map(r => r.id)
      }))
    case SET_UPDATING_USER_TEAM_LEVEL:
      return mapById(state, action.payload.id, team => ({
        ...team,
        updating: action.payload.updating
      }))
    case SET_DELETING_MEMBERSHIP:
      return mapById<ITeamsState, ITeam>(
        state,
        action.payload.teamID,
        team => ({
          ...team,
          // TODO: refactor membership into it's own reducer
          members: {
            ...team.members,
            [action.payload.membershipID]: {
              ...team.members[action.payload.membershipID],
              deleting: action.payload.val
            }
          }
        })
      )
    case SET_USER_TEAM_LEVEL:
      return mapById<ITeamsState, ITeam>(
        state,
        action.payload.teamID,
        team => ({
          ...team,
          // TODO: refactor membership into it's own reducer
          members: {
            ...team.members,
            [action.payload.membershipID]: {
              ...team.members[action.payload.membershipID],
              level: action.payload.level
            }
          }
        })
      )
    case SET_SENDING_TEAM_INVITES:
      return mapById(state, action.payload.teamID, team => ({
        ...team,
        sendingTeamInvites: action.payload.val
      }))
    case DELETE_MEMBERSHIP:
      return mapById<ITeamsState, ITeam>(
        state,
        action.payload.teamID,
        team => ({
          ...team,
          // TODO: refactor membership into it's own reducer
          members: omit(team.members, action.payload.membershipID)
        })
      )

    case getType(fetchTeams.success):
      return {
        ...state,
        loading: false,
        byId: action.payload.reduce(
          (a, b) => ({
            ...a,
            [b.id]: {
              ...state.byId[b.id],
              ...b
            }
          }),
          state.byId
        ),
        allIds: uniq(state.allIds.concat(action.payload.map(x => x.id)))
      }
    case getType(fetchTeams.request):
      return {
        ...state,
        loading: true
      }
    case SET_TEAM:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload.team
        },
        allIds: uniq(state.allIds.concat(action.payload.id))
      }
    case SET_CREATING_TEAM:
      return {
        ...state,
        creating: action.payload
      }
    case SET_COPYING_TEAM:
      return {
        ...state,
        copying: action.payload
      }
    case UPDATE_TEAM:
      return mapById(state, action.payload.id, () => action.payload.teamKeys)
    default:
      return state
  }
}

export default teams
