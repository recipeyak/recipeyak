import { uniq, omit } from "lodash"

import { IUser } from "./user"
import { action } from "typesafe-actions";
import { IRecipe } from "./recipes";

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
const SET_TEAMS = "SET_TEAMS"
const SET_LOADING_TEAMS = "SET_LOADING_TEAMS"
const SET_TEAM = "SET_TEAM"
const SET_CREATING_TEAM = "SET_CREATING_TEAM"
const SET_COPYING_TEAM = "SET_COPYING_TEAM"
const UPDATE_TEAM = "UPDATE_TEAM"

export const addTeam = (team: ITeam) => action(ADD_TEAM, team)
export const deleteTeam = (id: number) => action(DELETE_TEAM, id)
export const setLoadingTeam = (id: number, loadingTeam: boolean) => action(
  SET_LOADING_TEAM, {
  id,
  loadingTeam
})
export const setLoadingTeamMembers = (id: number, loadingMembers: boolean) => action(
  SET_LOADING_TEAM_MEMBERS, {
  id,
  loadingMembers
})

export const setLoadingTeamRecipes = (id: number, loadingRecipes: boolean) => action(
  SET_LOADING_TEAM_RECIPES, {
  id,
  loadingRecipes
})
export const setTeam404 = (id: number, val = true) => action(SET_TEAM_404, {
  id,
  val
})

export const setTeamMembers = (id: number, members: IMember[]) => action(
  SET_TEAM_MEMBERS, {
  id,
  members
})



export const setTeamRecipes = (id: number, recipes: IRecipe[]) => action(
  SET_TEAM_RECIPES,
{
  id,
  recipes
})



export const setUpdatingUserTeamLevel = (id: number, updating: boolean) => action(
  SET_UPDATING_USER_TEAM_LEVEL, {
  id,
  updating
})



export const setDeletingMembership = (
  teamID: number,
  membershipID: number,
  val: boolean
) => action(SET_DELETING_MEMBERSHIP, {
  teamID,
  membershipID,
  val
})


export const setUserTeamLevel = (
  teamID: number,
  membershipID: number,
  level: IMember['level']
) => action(
  SET_USER_TEAM_LEVEL,
{
  teamID,
  membershipID,
  level
})


export const setSendingTeamInvites = (teamID: number, val: boolean) => action(
  SET_SENDING_TEAM_INVITES, {
  teamID,
  val
})



export const deleteMembership = (teamID: number, membershipID: number) => action(
  DELETE_MEMBERSHIP, {
  teamID,
  membershipID
})



export const setLoadingTeams = (val: boolean) => action(
  SET_LOADING_TEAMS,
  val
)


export const setTeams = (teams: ITeam[]) => action(SET_TEAMS, teams)



export const setTeam = (id: number, team: ITeam) => action(
  SET_TEAM,{
  id,
  team
})



export const setCreatingTeam = (val: boolean) => action(
  SET_CREATING_TEAM,
  val
)



export const setCopyingTeam = (val: boolean) => action(
  SET_COPYING_TEAM,
  val
)



export const updateTeamById = (id: number, teamKeys: ITeam) => action(
   UPDATE_TEAM, {
  id,
  teamKeys
})

type TeamsActions =
 | ReturnType<typeof addTeam>
 | ReturnType<typeof deleteTeam>
 | ReturnType<typeof setLoadingTeam>
 | ReturnType<typeof setLoadingTeamMembers>
 | ReturnType<typeof setLoadingTeamRecipes  >
| ReturnType<typeof setTeam404 >
| ReturnType<typeof setTeamMembers >
| ReturnType<typeof setTeamRecipes >
| ReturnType<typeof setUpdatingUserTeamLevel >
| ReturnType<typeof setDeletingMembership >
| ReturnType<typeof setUserTeamLevel >
| ReturnType<typeof setSendingTeamInvites >
| ReturnType<typeof deleteMembership >
| ReturnType<typeof setTeams >
| ReturnType<typeof setLoadingTeams >
| ReturnType<typeof setTeam >
| ReturnType<typeof setCreatingTeam >
| ReturnType<typeof setCopyingTeam >
| ReturnType<typeof updateTeamById >

// TODO(sbdchd): check if these optional fields are always used (aka, required)
export interface IMember {
  readonly id: number
  readonly user: IUser
  readonly level?: "admin" | "contributor" | "viewer"
  readonly deleting?: boolean
  readonly is_active?: boolean
}

export interface ITeam {
  readonly id: number
  readonly name: string
  readonly loading?: boolean // TODO(sbdchd): maybe remove? Is it used?
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
  readonly [key: number]: ITeam
}

const initialState: ITeamsState = {
  allIds: []
}

export const teams = (state: ITeamsState = initialState, action: TeamsActions ): ITeamsState => {
  switch (action.type) {
    case ADD_TEAM:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          ...action.payload
        },
        allIds: uniq([...state.allIds, action.payload.id])
      }
    case DELETE_TEAM:
      return {
        ...omit(state, action.payload),
        allIds: state.allIds.filter(id => id !== action.payload)
      }
    case SET_LOADING_TEAM:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          loadingTeam: action.payload.loadingTeam
        }
      }
    case SET_LOADING_TEAM_MEMBERS:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          loadingMembers: action.payload.loadingMembers
        }
      }
    case SET_LOADING_TEAM_RECIPES:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          loadingRecipes: action.payload.loadingRecipes
        }
      }
    case SET_TEAM_404:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          error404: action.payload.val
        }
      }
    case SET_TEAM_MEMBERS:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          members: action.payload.members.reduce(
            (a, b) => ({
              ...a,
              [b.id]: b
            }),
            {}
          )
        }
      }
    case SET_TEAM_RECIPES:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          recipes: action.payload.recipes.map(r => r.id)
        }
      }
   case SET_UPDATING_USER_TEAM_LEVEL:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          updating: action.payload.updating
        }
      }
    case SET_DELETING_MEMBERSHIP:
      return {
        ...state,
        [action.payload.teamID]: {
          ...state[action.payload.teamID],
          // TODO: refactor membership into it's own reducer
          members: {
            ...state[action.payload.teamID].members,
            [action.payload.membershipID]: {
              ...state[action.payload.teamID].members[action.payload.membershipID],
              deleting: action.payload.val
            }
          }
        }
      }
    case SET_USER_TEAM_LEVEL:
      return {
        ...state,
        [action.payload.teamID]: {
          ...state[action.payload.teamID],
          // TODO: refactor membership into it's own reducer
          members: {
            ...state[action.payload.teamID].members,
            [action.payload.membershipID]: {
              ...state[action.payload.teamID].members[action.payload.membershipID],
              level: action.payload.level
            }
          }
        }
      }
    case SET_SENDING_TEAM_INVITES:
      return {
        ...state,
        [action.payload.teamID]: {
          ...state[action.payload.teamID],
          sendingTeamInvites: action.payload.val
        }
      }
    case DELETE_MEMBERSHIP:
      return {
        ...state,
        [action.payload.teamID]: {
          ...state[action.payload.teamID],
          // TODO: refactor membership into it's own reducer
          members: omit(state[action.payload.teamID].members, action.payload.membershipID)
        }
      }
    case SET_TEAMS:
      return {
        ...state,
        ...action.payload.reduce(
          (a, b) => ({
            ...a,
            [b.id]: {
              ...state[b.id],
              ...b
            }
          }),
          {}
        ),
        allIds: uniq([
          ...state.allIds,
          ...action.payload.map((x: { id: number }) => x.id)
        ])
      }
    case SET_LOADING_TEAMS:
      return {
        ...state,
        loading: action.payload
      }
    case SET_TEAM:
      return {
        ...state,
        [action.payload.id]: action.payload.team,
        allIds: uniq([...state.allIds, action.payload.id])
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
      return {
        ...state,
        [action.payload.id]: { ...state[action.payload.id], ...action.payload.teamKeys }
      }
    default:
      return state
  }
}

export default teams
