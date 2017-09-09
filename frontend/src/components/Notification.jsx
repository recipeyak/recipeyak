import React from 'react'
import PropTypes from 'prop-types'

import './Notification.scss'

const notification = ({
  message,
  level = 'info',
  show = true,
  closeable = false,
  close,
  }) => {
  return (
    show && <div className={'note note-bottom info ' + level}>
      <span className="content">{ message }</span>
      { closeable && close && <a className="close" onClick={close}>✕</a> }
    </div>)
}

notification.PropTypes = {
  message: PropTypes.string.isRequired,
  show: PropTypes.bool,
  closeable: PropTypes.bool,
  close: PropTypes.func,
  level: PropTypes.oneOf(['success', 'info', 'warning', 'danger']),
}

export default notification
