import React from 'react'

import './Notification.scss'

const notification = ({
  message,
  level = 'info',
  show = true,
  closeable = true,
  close
}) => {
  if (show) {
    return (
      <section className="note-container container">
        <div className={'note d-flex justify-space-between align-center ' + level }>
          <p className="mb-0 fs-5">
            { message }
          </p>
          { closeable && close &&
              <a className="close" onClick={close}>✕</a>
          }
        </div>
      </section>
    )
  }
  return null
}

export default notification
