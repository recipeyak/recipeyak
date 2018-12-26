import React from "react"

import { classNames } from "../classnames"

interface IModalProps {
  readonly onClose: () => void
  readonly className?: string
  readonly show: boolean
}

export default class Modal extends React.Component<IModalProps> {
  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown)
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.props.onClose()
    }
  }

  close = () => {
    this.props.onClose()
  }

  render() {
    const { show, children } = this.props
    return (
      <div className={classNames("modal", { "is-active": show })}>
        <div className="modal-background" onClick={this.close} />
        <div
          className={`modal-content overflow-y-auto ${this.props.className}`}>
          <div className="box">{children}</div>
        </div>
        <button
          className="modal-close is-large"
          aria-label="close"
          onClick={this.close}
        />
      </div>
    )
  }
}
