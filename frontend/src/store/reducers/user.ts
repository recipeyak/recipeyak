import raven from "raven-js"
import { ActionType, createStandardAction, getType } from "typesafe-actions"

import { IUser } from "@/api"
import { Action } from "@/store/store"

export const cacheUserInfo = createStandardAction(
  "FETCH_USER_SUCCESS",
)<IUser | null>()

export type UserActions = ActionType<typeof cacheUserInfo>

export interface IUserState {
  readonly id: null | number
  readonly loggedIn: boolean
  readonly avatarURL: string
  readonly email: string
  readonly name: string
  readonly scheduleTeamID: number | null
}

const initialState: IUserState = {
  id: null,
  loggedIn: false,
  avatarURL: "",
  email: "",
  name: "",
  scheduleTeamID: null,
}

// TODO: move this to react-query
export const user = (
  state: IUserState = initialState,
  action: Action,
): IUserState => {
  switch (action.type) {
    case getType(cacheUserInfo):
      if (action.payload == null) {
        raven.setUserContext()
        return initialState
      }
      raven.setUserContext({
        ...{
          email: state.email,
          id: state.id,
        },
        email: action.payload.email,
        id: action.payload.id,
      })
      return {
        // TODO: we can probably trim this down, we might only need the loggedIn attr
        ...state,
        loggedIn: true,
        email: action.payload.email,
        name: action.payload.name,
        avatarURL: action.payload.avatar_url,
        id: action.payload.id,
        scheduleTeamID: action.payload.schedule_team,
      }
    default:
      return state
  }
}

export default user
