import {
  SET_NOTIFICATION,
  CLEAR_NOTIFICATION
} from '../actionTypes.js'

const notification = (
  state = {
    message: '',
    level: 'info',
    closeable: false,
    show: false
  },
  {
    type,
    message,
    level,
    closeable
  }) => {
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
