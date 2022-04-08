import React from "react"

import { classNames } from "@/classnames"
import GlobalEvent from "@/components/GlobalEvent"

interface IModalProps {
  readonly onClose: () => void
  readonly className?: string
  readonly show: boolean
  readonly style: React.CSSProperties
}

export default class Modal extends React.Component<IModalProps> {
  element = React.createRef<HTMLDivElement>()

  handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.props.onClose()
    }
  }

  handleClick = (e: MouseEvent) => {
    const el = this.element.current
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions */
    if (el && e.target && !el.contains(e.target as Node)) {
      this.props.onClose()
    }
  }

  render() {
    const { show, children, onClose: close } = this.props
    return (
      <div
        ref={this.element}
        className={classNames("modal", { "is-active": show })}>
        <GlobalEvent keyUp={this.handleKeyUp} />
        <div className="modal-background" onClick={close} />
        <div
          className={`modal-content overflow-y-auto ${this.props.className}`}
          style={this.props.style}>
          <div className="box">{children}</div>
        </div>
        <button
          className="modal-close is-large"
          aria-label="close"
          onClick={close}
        />
      </div>
    )
  }
}
