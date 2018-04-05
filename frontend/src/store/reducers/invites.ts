import {
  SET_INVITES,
  SET_LOADING_INVITES,
  SET_DECLINING_INVITE,
  SET_ACCEPTING_INVITE,
  SET_ACCEPTED_INVITE,
  SET_DECLINED_INVITE,
} from '../actionTypes'

export interface Invite {
  id: number
}

export interface InvitesState {
  [key:number]: Invite
  loading: boolean
}

export interface SetInvites {
  type: typeof SET_INVITES
  invites: Invite[]
}

export interface SetLoadingInvites {
  type: typeof SET_LOADING_INVITES
  val: boolean
}

export interface SetAcceptingInvite {
  type: typeof SET_ACCEPTING_INVITE
  id: number
  val: boolean
}

export interface SetDecliningInvite {
  type: typeof SET_DECLINING_INVITE
  id: number
  val: boolean
}

export interface SetAcceptedInvite {
  type: typeof SET_ACCEPTED_INVITE
  id: number
}

export interface SetDeclinedInvite {
  type: typeof SET_DECLINED_INVITE
  id: number
}

type InvitesActions = SetInvites
  | SetLoadingInvites
  | SetAcceptingInvite
  | SetDecliningInvite
  | SetAcceptedInvite
  | SetDeclinedInvite

const invites = (
  state: InvitesState = {
    loading: false,
  },
  action: InvitesActions
) => {
  switch (action.type) {
  case SET_INVITES:
    return {
      ...state,
      ...action.invites.reduce((a, b) => ({
        ...a,
        [b.id]: b
      }), {})
    }
  case SET_LOADING_INVITES:
    return { ...state, loading: action.val }
  case SET_ACCEPTING_INVITE:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        accepting: action.val
      }
    }
  case SET_DECLINING_INVITE:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        declining: action.val,
      }
    }
  case SET_ACCEPTED_INVITE:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        status: 'accepted'
      }
    }
  case SET_DECLINED_INVITE:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        status: 'declined'
      }
    }
  default:
    return state
  }
}

export default invites
