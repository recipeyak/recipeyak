import { action as act } from "typesafe-actions"

const SET_INVITES = "SET_INVITES"
const SET_LOADING_INVITES = "SET_LOADING_INVITES"
const SET_ERROR_FETCHING_INVITES = "SET_ERROR_FETCHING_INVITES"
const SET_DECLINING_INVITE = "SET_DECLINING_INVITE"
const SET_ACCEPTING_INVITE = "SET_ACCEPTING_INVITE"
const SET_DECLINED_INVITE = "SET_DECLINED_INVITE"
const SET_ACCEPTED_INVITE = "SET_ACCEPTED_INVITE"

export const setLoadingInvites = (val: boolean) => act(SET_LOADING_INVITES, val)

export const setInvites = (inv: IInvite[]) => act(SET_INVITES, inv)

export const setErrorFetchingInvites = (val: unknown) =>
  act(SET_ERROR_FETCHING_INVITES, val)

export const setAcceptingInvite = (id: IInvite["id"], val: boolean) =>
  act(SET_ACCEPTING_INVITE, {
    id,
    val
  })

export const setAcceptedInvite = (id: number) => act(SET_ACCEPTED_INVITE, id)

export const setDecliningInvite = (id: IInvite["id"], val: boolean) =>
  act(SET_DECLINING_INVITE, {
    id,
    val
  })

export const setDeclinedInvite = (id: number) => act(SET_DECLINED_INVITE, id)

export type InviteActions =
  | ReturnType<typeof setLoadingInvites>
  | ReturnType<typeof setInvites>
  | ReturnType<typeof setErrorFetchingInvites>
  | ReturnType<typeof setAcceptingInvite>
  | ReturnType<typeof setAcceptedInvite>
  | ReturnType<typeof setDecliningInvite>
  | ReturnType<typeof setDeclinedInvite>

interface ITeam {
  readonly id: number
  readonly name: string
}

interface IUserPublic {
  readonly id: number
  readonly email: string
  readonly avatar_url: string
}

export interface IInvite {
  readonly id: number
  readonly accepting?: boolean
  readonly declining?: boolean
  readonly status: "accepted" | "declined" | "open"
  readonly active: boolean
  readonly team: ITeam
  readonly creator: IUserPublic
}

export interface IInvitesState {
  readonly loading: boolean
  readonly [key: number]: IInvite
}

export const initialState: IInvitesState = {
  loading: false
}

const invites = (
  state: IInvitesState = initialState,
  action: InviteActions
): IInvitesState => {
  switch (action.type) {
    case SET_INVITES:
      return {
        ...state,
        ...action.payload.reduce(
          (a, b) => ({
            ...a,
            [b.id]: b
          }),
          {}
        )
      }
    case SET_LOADING_INVITES:
      return { ...state, loading: action.payload }
    case SET_ACCEPTING_INVITE:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          accepting: action.payload.val
        }
      }
    case SET_DECLINING_INVITE:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          declining: action.payload.val
        }
      }
    case SET_ACCEPTED_INVITE:
      return {
        ...state,
        [action.payload]: {
          ...state[action.payload],
          status: "accepted"
        }
      }
    case SET_DECLINED_INVITE:
      return {
        ...state,
        [action.payload]: {
          ...state[action.payload],
          status: "declined"
        }
      }
    default:
      return state
  }
}

export default invites
