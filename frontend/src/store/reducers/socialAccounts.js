import {
  SET_SOCIAL_ACCOUNT_CONNECTIONS,
  SET_SOCIAL_ACCOUNT_CONNECTION,
} from '../actionTypes'

const initialState = {
  github: null,
  gitlab: null,
}

export const socialAccounts = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case SET_SOCIAL_ACCOUNT_CONNECTIONS:
      return {
        ...state,
        ...action.val.reduce((a, { provider, id }) => ({ ...a, [provider]: id }), {})
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
