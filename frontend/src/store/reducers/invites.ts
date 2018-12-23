import * as t from "../actionTypes"
import { AnyAction } from "redux"

interface ITeam {
  readonly id: number
  readonly name: string
}

export interface IInvite {
  readonly id: number
  readonly accepting?: boolean
  readonly declining?: boolean
  readonly status: "accepted" | "declined" | "open"
  readonly active: boolean
  readonly team: ITeam
}

export interface IInvitesState {
  readonly loading: boolean
  readonly [key: number]: IInvite
}

export const initialState: IInvitesState = {
  loading: false
}

const invites = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case t.SET_INVITES:
      return {
        ...state,
        ...action.invites.reduce(
          (a: unknown, b: IInvite) => ({
            ...a,
            [b.id]: b
          }),
          {}
        )
      }
    case t.SET_LOADING_INVITES:
      return { ...state, loading: action.val }
    case t.SET_ACCEPTING_INVITE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          accepting: action.val
        }
      }
    case t.SET_DECLINING_INVITE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          declining: action.val
        }
      }
    case t.SET_ACCEPTED_INVITE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          status: "accepted"
        }
      }
    case t.SET_DECLINED_INVITE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          status: "declined"
        }
      }
    default:
      return state
  }
}

export default invites
