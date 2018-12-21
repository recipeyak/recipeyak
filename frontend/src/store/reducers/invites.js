import {
  SET_INVITES,
  SET_LOADING_INVITES,
  SET_DECLINING_INVITE,
  SET_ACCEPTING_INVITE,
  SET_ACCEPTED_INVITE,
  SET_DECLINED_INVITE
} from "../actionTypes"

const invites = (
  state = {
    loading: false
  },
  action
) => {
  switch (action.type) {
    case SET_INVITES:
      return {
        ...state,
        ...action.invites.reduce(
          (a, b) => ({
            ...a,
            [b.id]: b
          }),
          {}
        )
      }
    case SET_LOADING_INVITES:
      return { ...state, loading: action.val }
    case SET_ACCEPTING_INVITE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          accepting: action.val
        }
      }
    case SET_DECLINING_INVITE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          declining: action.val
        }
      }
    case SET_ACCEPTED_INVITE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          status: "accepted"
        }
      }
    case SET_DECLINED_INVITE:
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
