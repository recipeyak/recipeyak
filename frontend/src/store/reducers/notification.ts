import * as t from "../actionTypes"
import { AnyAction } from "redux"

export interface INotificationState {
  readonly message: string
  readonly closeable?: boolean
  readonly level: "success" | "info" | "warning" | "danger"
  readonly show: boolean
}

export const initialState = {
  message: "",
  level: "info",
  closeable: false,
  show: false
}

const notification = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case t.SET_NOTIFICATION: {
      const { message, level, closeable } = action.notification
      return { ...state, message, level, closeable, show: true }
    }
    case t.CLEAR_NOTIFICATION: {
      return { ...state, message: "", show: false, closeable: false }
    }
    default:
      return state
  }
}

export default notification
