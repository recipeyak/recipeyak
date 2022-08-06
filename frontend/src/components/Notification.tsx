import { INotificationState } from "@/store/reducers/notification"

interface INotificationProps extends INotificationState {
  readonly close: () => void
}

const notification = ({
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

export default notification
