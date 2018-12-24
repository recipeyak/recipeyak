import { uniq, omit } from "lodash"

import t from "../actionTypes"
import { IUser } from "./user"

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

export const teams = (state = initialState, action: any) => {
  switch (action.type) {
    case t.ADD_TEAM:
      return {
        ...state,
        [action.team.id]: {
          ...state[action.team.id],
          ...action.team
        },
        allIds: uniq([...state.allIds, action.team.id])
      }
    case t.DELETE_TEAM:
      return {
        ...omit(state, action.id),
        allIds: state.allIds.filter(id => id !== action.id)
      }
    case t.SET_LOADING_TEAM:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingTeam: action.loadingTeam
        }
      }
    case t.SET_LOADING_TEAM_MEMBERS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingMembers: action.loadingMembers
        }
      }
    case t.SET_LOADING_TEAM_INVITES:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingInvites: action.loadingInvites
        }
      }
    case t.SET_LOADING_TEAM_RECIPES:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loadingRecipes: action.loadingRecipes
        }
      }
    case t.SET_TEAM_404:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          error404: action.val
        }
      }
    case t.SET_TEAM_MEMBERS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          members: action.members.reduce(
            (a: unknown, b: { id: number }) => ({
              ...a,
              [b.id]: b
            }),
            {}
          )
        }
      }
    case t.SET_TEAM_INVITES:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          invites: action.invites.reduce(
            (a: unknown, b: { id: number }) => ({
              ...a,
              [b.id]: b
            }),
            {}
          )
        }
      }
    case t.SET_TEAM_RECIPES:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          recipes: action.recipes.map(({ id }: { id: number }) => id)
        }
      }
    case t.SET_UPDATING_MEMBERSHIP:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          updating: action.val
        }
      }
    case t.SET_UPDATING_USER_TEAM_LEVEL:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          updating: action.updating
        }
      }
    case t.SET_DELETING_MEMBERSHIP:
      return {
        ...state,
        [action.teamID]: {
          ...state[action.teamID],
          // TODO: refactor membership into it's own reducer
          members: {
            ...state[action.teamID].members,
            [action.membershipID]: {
              ...state[action.teamID].members[action.membershipID],
              deleting: action.val
            }
          }
        }
      }
    case t.SET_USER_TEAM_LEVEL:
      return {
        ...state,
        [action.teamID]: {
          ...state[action.teamID],
          // TODO: refactor membership into it's own reducer
          members: {
            ...state[action.teamID].members,
            [action.membershipID]: {
              ...state[action.teamID].members[action.membershipID],
              level: action.level
            }
          }
        }
      }
    case t.SET_SENDING_TEAM_INVITES:
      return {
        ...state,
        [action.teamID]: {
          ...state[action.teamID],
          sendingTeamInvites: action.val
        }
      }
    case t.DELETE_MEMBERSHIP:
      return {
        ...state,
        [action.teamID]: {
          ...state[action.teamID],
          // TODO: refactor membership into it's own reducer
          members: omit(state[action.teamID].members, action.membershipID)
        }
      }
    case t.SET_TEAMS:
      return {
        ...state,
        ...action.teams.reduce(
          (a: unknown, b: { id: number }) => ({
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
          ...action.teams.map((x: { id: number }) => x.id)
        ])
      }
    case t.SET_LOADING_TEAMS:
      return {
        ...state,
        loading: action.val
      }
    case t.SET_TEAM:
      return {
        ...state,
        [action.id]: action.team,
        allIds: uniq([...state.allIds, action.id])
      }
    case t.SET_CREATING_TEAM:
      return {
        ...state,
        creating: action.val
      }
    case t.SET_MOVING_TEAM:
      return {
        ...state,
        moving: action.val
      }
    case t.SET_COPYING_TEAM:
      return {
        ...state,
        copying: action.val
      }
    case t.UPDATE_TEAM:
      return {
        ...state,
        [action.id]: { ...state[action.id], ...action.teamKeys }
      }
    default:
      return state
  }
}

export default teams
