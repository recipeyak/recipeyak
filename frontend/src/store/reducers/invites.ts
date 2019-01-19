import {
  createAsyncAction,
  ActionType,
  getType,
  createStandardAction
} from "typesafe-actions"
import { RootState } from "@/store/store"

export const fetchInvites = createAsyncAction(
  "FETCH_INVITES_START",
  "FETCH_INVITES_SUCCESS",
  "FETCH_INVITES_FAILURE"
)<void, IInvite[], void>()
export const setAcceptingInvite = createStandardAction("SET_ACCEPTING_INVITE")<{
  id: IInvite["id"]
  val: boolean
}>()
export const setAcceptedInvite = createStandardAction("SET_ACCEPTED_INVITE")<
  IInvite["id"]
>()
export const setDecliningInvite = createStandardAction("SET_DECLINING_INVITE")<{
  id: IInvite["id"]
  val: boolean
}>()
export const setDeclinedInvite = createStandardAction("SET_DECLINED_INVITE")<
  IInvite["id"]
>()

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
    case getType(setAcceptingInvite):
      return mapById(state, action.payload.id, invite => ({
        ...invite,
        accepting: action.payload.val
      }))
    case getType(setDecliningInvite):
      return mapById(state, action.payload.id, invite => ({
        ...invite,
        declining: action.payload.val
      }))
    case getType(setAcceptedInvite):
      return mapById(state, action.payload, invite => ({
        ...invite,
        status: "accepted"
      }))
    case getType(setDeclinedInvite):
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
