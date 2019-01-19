import { createStandardAction, getType } from "typesafe-actions"

interface ISetNotification {
  readonly message: string
  readonly closeable?: boolean
  readonly level?: INotificationState["level"]
}

export const setNotification = createStandardAction("SET_NOTIFICATION")<
  ISetNotification
>()
export const clearNotification = createStandardAction("CLEAR_NOTIFICATION")()

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

const notification = (
  state: INotificationState = initialState,
  action: NotificationsActions
): INotificationState => {
  switch (action.type) {
    case getType(setNotification): {
      const { message, level = "info", closeable } = action.payload
      return { ...state, message, level, closeable, show: true }
    }
    case getType(clearNotification):
      return { ...state, message: "", show: false, closeable: false }
    default:
      return state
  }
}

export default notification
