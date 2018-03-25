import { uniq, omit } from 'lodash'

import {
  ADD_TEAM,
  SET_LOADING_TEAM,
  SET_LOADING_TEAM_MEMBERS,
  SET_LOADING_TEAM_INVITES,
  SET_TEAM_404,
  SET_TEAM_MEMBERS,
  SET_TEAM_INVITES,
  SET_LOADING_TEAM_RECIPES,
  SET_TEAM_RECIPES,
  SET_DELETING_MEMBERSHIP,
  DELETE_MEMBERSHIP,
  SET_UPDATING_MEMBERSHIP,
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

export const teams = (
  state = {
    allIds: [],
  }, action) => {
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
  case SET_LOADING_TEAM_INVITES:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        loadingInvites: action.loadingInvites
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
  case SET_TEAM_INVITES:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        invites: action.invites.reduce((a, b) => ({
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
  case SET_UPDATING_MEMBERSHIP:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        updating: action.val,
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
      [action.id]: { ...state[action.id], ...action.teamKeys }
    }
  default:
    return state
  }
}

export default teams
