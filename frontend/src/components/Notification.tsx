import { connect } from "react-redux"

import {
  clearNotification,
  INotificationState,
} from "@/store/reducers/notification"
import { IState } from "@/store/store"
import { Dispatch } from "@/store/thunks"

interface INotificationProps extends INotificationState {
  readonly close: () => void
}

const Notification = ({
  message,
  level = "info",
  show = true,
  closeable = true,
  close,
}: INotificationProps) => {
  if (show) {
    return (
      <section className="note-container container">
        <div
          className={"note d-flex justify-space-between align-center " + level}
        >
          <p className="mb-0 fs-5">{message}</p>
          {closeable && close && (
            <a className="close" onClick={close}>
              ✕
            </a>
          )}
        </div>
      </section>
    )
  }
  return null
}

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
