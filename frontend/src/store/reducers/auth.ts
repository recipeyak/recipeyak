import { action as act } from "typesafe-actions"

const SET_FROM_URL = "SET_FROM_URL"

export const setFromUrl = (val: string) => act(SET_FROM_URL, val)

export type AuthActions = ReturnType<typeof setFromUrl>

export interface IAuthState {
  readonly fromUrl: string
}

const initialState: IAuthState = {
  fromUrl: ""
}

const auth = (
  state: IAuthState = initialState,
  action: AuthActions
): IAuthState => {
  switch (action.type) {
    case SET_FROM_URL:
      return { ...state, fromUrl: action.payload }
    default:
      return state
  }
}

export default auth
