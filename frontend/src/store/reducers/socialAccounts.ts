import {
  SET_SOCIAL_ACCOUNT_CONNECTIONS,
  SET_SOCIAL_ACCOUNT_CONNECTION
} from "../actionTypes"
import { ISocialConnection } from "./user"

export interface ISocialAccountsState {
  readonly github: ISocialConnection | null
  readonly gitlab: ISocialConnection | null
}

const initialState: ISocialAccountsState = {
  github: null,
  gitlab: null
}

export const socialAccounts = (
  state: ISocialAccountsState = initialState,
  action: any
) => {
  switch (action.type) {
    case SET_SOCIAL_ACCOUNT_CONNECTIONS:
      return {
        ...state,
        ...action.val.reduce(
          (acc: any, { provider, id }: any) => ({ ...acc, [provider]: id }),
          {}
        )
      }
    case SET_SOCIAL_ACCOUNT_CONNECTION:
      return {
        ...state,
        [action.provider]: action.val
      }
    default:
      return state
  }
}

export default socialAccounts
