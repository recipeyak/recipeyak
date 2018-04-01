import { uniq, omit } from 'lodash'

import {
  ADD_TEAM,
  SET_LOADING_TEAM,
  SET_LOADING_TEAM_MEMBERS,
  SET_TEAM_404,
  SET_TEAM_MEMBERS,
  SET_LOADING_TEAM_RECIPES,
  SET_TEAM_RECIPES,
  SET_DELETING_MEMBERSHIP,
  DELETE_MEMBERSHIP,
  SET_UPDATING_USER_TEAM_LEVEL,
  SET_USER_TEAM_LEVEL,
  SET_SENDING_TEAM_INVITES,
  SET_TEAMS,
  SET_LOADING_TEAMS,
  SET_TEAM,
  SET_CREATING_TEAM,
  SET_MOVING_TEAM,
  SET_COPYING_TEAM,
  DELETE_TEAM,
  UPDATE_TEAM,
} from '../actionTypes'

import { Recipe } from './recipes'

import {
  User
} from './user'

export interface Member {
  id: number
  user: User
  level: 'admin' | 'contributor' | 'viewer'
  is_active: boolean
}

export interface Team {
  id: number
  name: string
  members: {
    [key:number]: Member
  }
  recipes: number[]
}

export interface TeamOptional {
  id?: number
  name?: string
}

interface AddTeam {
  type: typeof ADD_TEAM
  team: Team
}

export interface DeleteTeam {
  type: typeof DELETE_TEAM
  id: number
}

interface SetLoadingTeam {
  type: typeof SET_LOADING_TEAM
  id: number
  loadingTeam: boolean
}

interface SetLoadingTeamMembers {
  type: typeof SET_LOADING_TEAM_MEMBERS
  id: number
  loadingMembers: boolean
}

interface SetLoadingTeamRecipes {
  type: typeof SET_LOADING_TEAM_RECIPES
  id: number
  loadingRecipes: boolean
}

interface SetTeam404 {
  type: typeof SET_TEAM_404
  id: number
  val: boolean
}

interface SetTeamMembers {
  type: typeof SET_TEAM_MEMBERS
  members: Member[]
  id: number
}

interface SetTeamRecipes {
  type: typeof SET_TEAM_RECIPES
  recipes: Recipe[]
  id: number
}

interface SetUpdatingUserTeamLevel {
  type: typeof SET_UPDATING_USER_TEAM_LEVEL
  id: number
  updating: boolean
}

export interface SetDeletingMembership {
  type: typeof SET_DELETING_MEMBERSHIP
  val: boolean
  teamID: number
  membershipID: number
}

export type TeamLevel = 'admin' | 'contributor' | 'read'

interface SetUserTeamLevel {
  type: typeof SET_USER_TEAM_LEVEL
  level: TeamLevel
  teamID: number
  membershipID: number
}

interface SetSendingTeamInvites {
  type: typeof SET_SENDING_TEAM_INVITES
  val: number
  teamID: number
}

export interface DeleteMembership {
  type: typeof DELETE_MEMBERSHIP
  teamID: number
  membershipID: number
}

interface SetTeams {
  type: typeof SET_TEAMS
  teams: Team[]
}

interface SetTeam {
  type: typeof SET_TEAM
  id: number
  team: Team
}

interface SetCreatingTeam {
  type: typeof SET_CREATING_TEAM
  val: boolean
}

export interface SetMovingTeam {
  type: typeof SET_MOVING_TEAM
  val: boolean
}

export interface SetCopyingTeam {
  type: typeof SET_COPYING_TEAM
  val: boolean
}

export interface SetLoadingTeams {
  type: typeof SET_LOADING_TEAMS
  val: boolean
}

interface UpdateTeam {
  type: typeof UPDATE_TEAM
  teamKeys: number[]
  id: number
}

type TeamsActions = AddTeam
  | DeleteTeam
  | SetLoadingTeam
  | SetLoadingTeamMembers
  | SetLoadingTeamRecipes
  | SetLoadingTeams
  | SetTeam404
  | SetTeamMembers
  | SetTeamRecipes
  | SetUpdatingUserTeamLevel
  | SetDeletingMembership
  | SetUserTeamLevel
  | SetSendingTeamInvites
  | DeleteMembership
  | SetTeams
  | SetTeam
  | SetCreatingTeam
  | SetMovingTeam
  | SetCopyingTeam
  | UpdateTeam

export interface TeamState  {
  [key:number]: Team
  allIds: number[]
  loading: boolean
  creating: boolean
}

const initialState: TeamState = {
  allIds: [] as number[],
  loading: false,
  creating: false,
}

export const teams = (
  state = initialState,
  action: TeamsActions) => {
  switch (action.type) {
  case ADD_TEAM:
    return {
      ...state,
      [action.team.id]: {
        ...state[action.team.id],
        ...action.team
      },
      allIds: uniq([...state.allIds, action.team.id]),
    }
  case DELETE_TEAM:
    return {
      ...omit(state, action.id),
      allIds: state.allIds.filter(id => id !== action.id)
    }
  case SET_LOADING_TEAM:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        loadingTeam: action.loadingTeam
      }
    }
  case SET_LOADING_TEAM_MEMBERS:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        loadingMembers: action.loadingMembers
      }
    }
  case SET_LOADING_TEAM_RECIPES:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        loadingRecipes: action.loadingRecipes
      }
    }
  case SET_TEAM_404:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        error404: action.val
      }
    }
  case SET_TEAM_MEMBERS:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        members: action.members.reduce((a, b) => ({
          ...a,
          [b.id]: b
        }), {})
      }
    }
  case SET_TEAM_RECIPES:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        recipes: action.recipes.map(({ id }) => id)
      }
    }
  case SET_UPDATING_USER_TEAM_LEVEL:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        updating: action.updating,
      }
    }
  case SET_DELETING_MEMBERSHIP:
    return {
      ...state,
      [action.teamID]: {
        ...state[action.teamID],
          // TODO: refactor membership into it's own reducer
        members: {
          ...state[action.teamID].members,
          [action.membershipID]: {
            ...state[action.teamID].members[action.membershipID],
            deleting: action.val,
          }
        }
      }
    }
  case SET_USER_TEAM_LEVEL:
    return {
      ...state,
      [action.teamID]: {
        ...state[action.teamID],
          // TODO: refactor membership into it's own reducer
        members: {
          ...state[action.teamID].members,
          [action.membershipID]: {
            ...state[action.teamID].members[action.membershipID],
            level: action.level,
          }
        }
      }
    }
  case SET_SENDING_TEAM_INVITES:
    return {
      ...state,
      [action.teamID]: {
        ...state[action.teamID],
        sendingTeamInvites: action.val
      }
    }
  case DELETE_MEMBERSHIP:
    return {
      ...state,
      [action.teamID]: {
        ...state[action.teamID],
          // TODO: refactor membership into it's own reducer
        members: omit(state[action.teamID].members, action.membershipID),
      }
    }
  case SET_TEAMS:
    return {
      ...state,
      ...action.teams.reduce((a, b) => ({
        ...a,
        [b.id]: {
          ...state[b.id],
          ...b,
        }
      }), {}),
      allIds: uniq([...state.allIds, ...action.teams.map(x => x.id)])
    }
  case SET_LOADING_TEAMS:
    return {
      ...state,
      loading: action.val,
    }
  case SET_TEAM:
    return {
      ...state,
      [action.id]: action.team,
      allIds: uniq([...state.allIds, action.id])
    }
  case SET_CREATING_TEAM:
    return {
      ...state,
      creating: action.val
    }
  case SET_MOVING_TEAM:
    return {
      ...state,
      moving: action.val,
    }
  case SET_COPYING_TEAM:
    return {
      ...state,
      copying: action.val,
    }
  case UPDATE_TEAM:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        ...action.teamKeys
      }
    }
  default:
    return state
  }
}

export default teams
