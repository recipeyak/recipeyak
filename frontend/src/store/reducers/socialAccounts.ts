import * as t from "../actionTypes"
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
    case t.SET_SOCIAL_ACCOUNT_CONNECTIONS:
      return {
        ...state,
        ...action.val.reduce(
          (acc: any, { provider, id }: any) => ({ ...acc, [provider]: id }),
          {}
        )
      }
    case t.SET_SOCIAL_ACCOUNT_CONNECTION:
      return {
        ...state,
        [action.provider]: action.val
      }
    default:
      return state
  }
}

export default socialAccounts
