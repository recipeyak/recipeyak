import { SET_NOTIFICATION, CLEAR_NOTIFICATION } from "../actionTypes"

const initialState = {
  message: "",
  level: "info",
  closeable: false,
  show: false
}

const notification = (state = initialState, action) => {
  switch (action.type) {
    case SET_NOTIFICATION: {
      const { message, level, closeable } = action.notification
      return { ...state, message, level, closeable, show: true }
    }
    case CLEAR_NOTIFICATION: {
      return { ...state, message: "", show: false, closeable: false }
    }
    default:
      return state
  }
}

export default notification
