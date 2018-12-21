import { SET_FROM_URL } from "../actionTypes"

const auth = (
  state = {
    fromUrl: ""
  },
  action
) => {
  switch (action.type) {
    case SET_FROM_URL:
      return { ...state, fromUrl: action.val }
    default:
      return state
  }
}

export default auth
