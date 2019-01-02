import {
  action as act,
  createAsyncAction,
  ActionType,
  getType
} from "typesafe-actions"
import { RootState } from "@/store/store"

const SET_DECLINING_INVITE = "SET_DECLINING_INVITE"
const SET_ACCEPTING_INVITE = "SET_ACCEPTING_INVITE"
const SET_DECLINED_INVITE = "SET_DECLINED_INVITE"
const SET_ACCEPTED_INVITE = "SET_ACCEPTED_INVITE"

export const fetchInvites = createAsyncAction(
  "FETCH_INVITES_START",
  "FETCH_INVITES_SUCCESS",
  "FETCH_INVITES_FAILURE"
)<void, IInvite[], void>()
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
  | ReturnType<typeof setAcceptingInvite>
  | ReturnType<typeof setAcceptedInvite>
  | ReturnType<typeof setDecliningInvite>
  | ReturnType<typeof setDeclinedInvite>
  | ActionType<typeof fetchInvites>

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

function mapById(
  state: IInvitesState,
  id: IInvite["id"],
  func: (invite: IInvite) => IInvite
): IInvitesState {
  const invite = state.byId[id]
  return {
    ...state,
    byId: {
      ...state.byId,
      [id]: func(invite)
    }
  }
}

export interface IInvitesState {
  readonly loading: boolean
  readonly byId: {
    readonly [key: number]: IInvite
  }
}

export const initialState: IInvitesState = {
  loading: false,
  byId: {}
}

const invites = (
  state: IInvitesState = initialState,
  action: InviteActions
): IInvitesState => {
  switch (action.type) {
    case getType(fetchInvites.success):
      return {
        ...state,
        loading: false,
        byId: {
          ...state.byId,
          ...action.payload.reduce(
            (a, b) => ({
              ...a,
              [b.id]: b
            }),
            {}
          )
        }
      }
    case getType(fetchInvites.request):
      return { ...state, loading: true }
    case getType(fetchInvites.failure):
      return { ...state, loading: false }
    case SET_ACCEPTING_INVITE:
      return mapById(state, action.payload.id, invite => ({
        ...invite,
        accepting: action.payload.val
      }))
    case SET_DECLINING_INVITE:
      return mapById(state, action.payload.id, invite => ({
        ...invite,
        declining: action.payload.val
      }))
    case SET_ACCEPTED_INVITE:
      return mapById(state, action.payload, invite => ({
        ...invite,
        status: "accepted"
      }))
    case SET_DECLINED_INVITE:
      return mapById(state, action.payload, invite => ({
        ...invite,
        status: "declined"
      }))
    default:
      return state
  }
}

export default invites

export function getInvites(state: RootState): IInvite[] {
  return Object.values(state.invites.byId)
}
