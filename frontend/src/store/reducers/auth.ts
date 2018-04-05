import {
  SET_FROM_URL
} from '../actionTypes'

interface SetFromURL {
  type: typeof SET_FROM_URL
  val: string
}

const initialState = {
  fromUrl: '',
}

export type AuthState = typeof initialState

type AuthActions = SetFromURL

const auth = (state = initialState, action: AuthActions) => {
  switch (action.type) {
  case SET_FROM_URL:
    return { ...state, fromUrl: action.val }
  default:
    return state
  }
}

export default auth
