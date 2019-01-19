import { uniq, omit } from "lodash"
import { IUser } from "@/store/reducers/user"
import {
  createAsyncAction,
  getType,
  ActionType,
  createStandardAction
} from "typesafe-actions"
import { IRecipe } from "@/store/reducers/recipes"

export const deleteTeam = createStandardAction("DELETE_TEAM")<ITeam["id"]>()

export const fetchTeam = createAsyncAction(
  "FETCH_TEAM_REQUEST",
  "FETCH_TEAM_SUCCESS",
  "FETCH_TEAM_FAILURE"
)<ITeam["id"], ITeam, { id: ITeam["id"]; error404?: boolean }>()
export const fetchTeamMembers = createAsyncAction(
  "FETCH_TEAM_MEMBERS_REQUEST",
  "FETCH_TEAM_MEMBERS_SUCCESS",
  "FETCH_TEAM_MEMBERS_FAILURE"
)<
  ITeam["id"],
  {
    id: ITeam["id"]
    members: IMember[]
  },
  ITeam["id"]
>()

export const fetchTeamRecipes = createAsyncAction(
  "FETCH_TEAM_RECIPES_REQUEST",
  "FETCH_TEAM_RECIPES_SUCCESS",
  "FETCH_TEAM_RECIPES_FAILURE"
)<
  ITeam["id"],
  {
    id: ITeam["id"]
    recipes: IRecipe[]
  },
  ITeam["id"]
>()

export const setUpdatingUserTeamLevel = createStandardAction(
  "SET_UPDATING_USER_TEAM_LEVEL"
)<{ id: ITeam["id"]; updating: boolean }>()
export const setDeletingMembership = createStandardAction(
  "SET_DELETING_MEMBERSHIP"
)<{ teamID: number; membershipID: number; val: boolean }>()
export const setUserTeamLevel = createStandardAction("SET_USER_TEAM_LEVEL")<{
  teamID: ITeam["id"]
  membershipID: IMember["id"]
  level: IMember["level"]
}>()
export const setSendingTeamInvites = createStandardAction(
  "SET_SENDING_TEAM_INVITES"
)<{ teamID: ITeam["id"]; val: boolean }>()
export const deleteMembership = createStandardAction("DELETE_MEMBERSHIP")<{
  teamID: ITeam["id"]
  membershipID: IMember["id"]
}>()
// TODO(sbdchd): we shouldn't need to pass id as a seperate obj prop
export const setTeam = createStandardAction("SET_TEAM")<{
  id: ITeam["id"]
  team: ITeam
}>()
export const setCreatingTeam = createStandardAction("SET_CREATING_TEAM")<
  boolean
>()
export const setCopyingTeam = createStandardAction("SET_COPYING_TEAM")<
  boolean
>()
export const updateTeamById = createStandardAction("UPDATE_TEAM")<{
  id: ITeam["id"]
  teamKeys: ITeam
}>()
export const fetchTeams = createAsyncAction(
  "FETCH_TEAMS_START",
  "FETCH_TEAMS_SUCCESS",
  "FETCH_TEAMS_FAILURE"
)<void, ITeam[], void>()

export type TeamsActions =
  | ReturnType<typeof deleteTeam>
  | ActionType<typeof fetchTeamMembers>
  | ActionType<typeof fetchTeamRecipes>
  | ReturnType<typeof setUpdatingUserTeamLevel>
  | ReturnType<typeof setDeletingMembership>
  | ReturnType<typeof setUserTeamLevel>
  | ReturnType<typeof setSendingTeamInvites>
  | ReturnType<typeof deleteMembership>
  | ActionType<typeof fetchTeam>
  | ActionType<typeof setTeam>
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

function mapById<
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

// TODO(sbdchd): teams should use WebData<T>
const initialState: ITeamsState = {
  byId: {},
  allIds: []
}

export const teams = (
  state: ITeamsState = initialState,
  action: TeamsActions
): ITeamsState => {
  switch (action.type) {
    case getType(fetchTeam.request):
      return mapById(state, action.payload, team => ({
        ...team,
        loadingTeam: true
      }))
    case getType(fetchTeam.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ...action.payload,
            loadingTeam: false
          }
        },
        allIds: uniq([...state.allIds, action.payload.id])
      }
    case getType(fetchTeam.failure):
      return mapById(state, action.payload.id, team => ({
        ...team,
        loadingTeam: false,
        error404: action.payload.error404 || false
      }))
    case getType(deleteTeam):
      return {
        ...state,
        byId: omit(state.byId, action.payload),
        allIds: state.allIds.filter(id => id !== action.payload)
      }
    case getType(fetchTeamMembers.request):
      return mapById(state, action.payload, team => ({
        ...team,
        loadingMembers: true
      }))
    case getType(fetchTeamMembers.success):
      return mapById(state, action.payload.id, team => ({
        ...team,
        members: action.payload.members.reduce(
          (a, b) => ({
            ...a,
            [b.id]: b
          }),
          {}
        ),
        loadingMembers: false
      }))
    case getType(fetchTeamMembers.failure):
      return mapById(state, action.payload, team => ({
        ...team,
        loadingMembers: false
      }))
    case getType(fetchTeamRecipes.request):
      return mapById(state, action.payload, team => ({
        ...team,
        loadingRecipes: true
      }))
    case getType(fetchTeamRecipes.success):
      return mapById(state, action.payload.id, team => ({
        ...team,
        recipes: action.payload.recipes.map(r => r.id),
        loadingRecipes: false
      }))
    case getType(fetchTeamRecipes.failure):
      return mapById(state, action.payload, team => ({
        ...team,
        loadingRecipes: false
      }))
    case getType(setUpdatingUserTeamLevel):
      return mapById(state, action.payload.id, team => ({
        ...team,
        updating: action.payload.updating
      }))
    case getType(setDeletingMembership):
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
    case getType(setUserTeamLevel):
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
    case getType(setSendingTeamInvites):
      return mapById(state, action.payload.teamID, team => ({
        ...team,
        sendingTeamInvites: action.payload.val
      }))
    case getType(deleteMembership):
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
    case getType(setTeam):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload.team
        },
        allIds: uniq(state.allIds.concat(action.payload.id))
      }
    case getType(setCreatingTeam):
      return {
        ...state,
        creating: action.payload
      }
    case getType(setCopyingTeam):
      return {
        ...state,
        copying: action.payload
      }
    case getType(updateTeamById):
      return mapById(state, action.payload.id, () => action.payload.teamKeys)
    default:
      return state
  }
}

export default teams
