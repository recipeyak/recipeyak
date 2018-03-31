import {
  SET_NOTIFICATION,
  CLEAR_NOTIFICATION
} from '../actionTypes'

interface Notification {
  message: string
  level: string
  show: false
  closeable: false
}

interface SetNotification extends Notification {
  type: typeof SET_NOTIFICATION
}

interface ClearNotification extends Notification {
  type: typeof CLEAR_NOTIFICATION
}

type NotificationAction = SetNotification
  | ClearNotification

const initialState = {
  message: '',
  level: 'info',
  closeable: false,
  show: false
}

export type NotificationState = typeof initialState

const notification = (
  state = initialState,
  {
    type,
    message,
    level,
    closeable
  }: NotificationAction) => {
  switch (type) {
  case SET_NOTIFICATION:
    return { ...state, message, level, closeable, show: true }
  case CLEAR_NOTIFICATION:
    return { ...state, message: '', show: false, closeable: false }
  default:
    return state
  }
}

export default notification
