import {
  SET_SOCIAL_ACCOUNT_CONNECTIONS,
} from '../actionTypes'

export interface Provider {
  id: number
  provider: string
}

export interface SetSocialAccountConnections {
  type: typeof SET_SOCIAL_ACCOUNT_CONNECTIONS
  val: Provider[]
}

type SocialAccountsActions = SetSocialAccountConnections

const initialState = {
}

export const socialAccounts = (
  state = initialState,
  action: SocialAccountsActions
) => {
  switch (action.type) {
  case SET_SOCIAL_ACCOUNT_CONNECTIONS:
    return {
      ...state,
      ...action.val.reduce((a, { provider, id }) => ({ ...a, [provider]: id }), {})
    }
  default:
    return state
  }
}

export default socialAccounts
