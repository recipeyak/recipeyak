import { connect } from "react-redux"

import Notification from "@/components/Notification"
import { clearNotification } from "@/store/reducers/notification"
import { IState } from "@/store/store"
import { Dispatch } from "@/store/thunks"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    close: () => dispatch(clearNotification()),
  }
}

const mapStateToProps = (state: IState) => {
  return {
    message: state.notification.message,
    closeable: state.notification.closeable,
    show: state.notification.show,
    level: state.notification.level,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notification)
