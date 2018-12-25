import { action } from "typesafe-actions";




const SET_NOTIFICATION = "SET_NOTIFICATION"
const CLEAR_NOTIFICATION = "CLEAR_NOTIFICATION"

interface ISetNotification {
  readonly message: string
  readonly closeable?: boolean
  readonly level?: INotificationState["level"]
}

export const setNotification = ({
  message,
  closeable,
  level = "info"
}: ISetNotification) => action(
  SET_NOTIFICATION, {
  notification: {
    message,
    closeable,
    level
  }
})

export const clearNotification = () => action( CLEAR_NOTIFICATION)


export type NotificationsActions =
  | ReturnType<typeof setNotification>
  | ReturnType<typeof clearNotification>

export interface INotificationState {
  readonly message: string
  readonly closeable?: boolean
  readonly level: "success" | "info" | "warning" | "danger"
  readonly show: boolean
}

export const initialState: INotificationState = {
  message: "",
  level: "info",
  closeable: false,
  show: false
}

const notification = (state: INotificationState = initialState, action: NotificationsActions): INotificationState => {
  switch (action.type) {
    case SET_NOTIFICATION: {
      const { message, level, closeable } = action.payload.notification
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
