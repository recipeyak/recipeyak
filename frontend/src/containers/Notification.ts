import { connect, Dispatch } from 'react-redux'
import { StateTree } from '../store/store'

import { clearNotification } from '../store/actions'
import Notification from '../components/Notification'

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
  return {
    close: () => dispatch(clearNotification())
  }
}

const mapStateToProps = (state: StateTree) => {
  return {
    message: state.notification.message,
    closeable: state.notification.closeable,
    show: state.notification.show,
    level: state.notification.level
  }
}

const ConnectedNotification = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(Notification)

export default ConnectedNotification
