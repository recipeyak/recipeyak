import { connect } from 'react-redux'

import { clearNotification } from '../store/actions.js'
import Notification from '../components/Notification.jsx'

const mapDispatchToProps = dispatch => {
  return {
    close: () => dispatch(clearNotification())
  }
}

const mapStateToProps = state => {
  return {
    message: state.notification.message,
    closeable: state.notification.closeable,
    show: state.notification.show,
    level: state.notification.level
  }
}

const ConnectedNotification = connect(
  mapStateToProps,
  mapDispatchToProps
)(Notification)

export default ConnectedNotification
