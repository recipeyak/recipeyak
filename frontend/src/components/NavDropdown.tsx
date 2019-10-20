import React from "react"
import { Chevron } from "@/components/icons"

interface IDropdownProps {
  readonly relative: boolean
  readonly name: string
}

interface IDropdownState {
  readonly show: boolean
}

export default class Dropdown extends React.Component<
  IDropdownProps,
  IDropdownState
> {
  static defaultProps = {
    relative: true
  }

  state = {
    show: false
  }

  handleGeneralClick = () => {
    if (this.state.show) {
      document.removeEventListener("click", this.handleGeneralClick)
    }
    this.setState({ show: false })
  }

  toggle = () => {
    if (this.state.show) {
      document.removeEventListener("click", this.handleGeneralClick)
    } else {
      document.addEventListener("click", this.handleGeneralClick)
    }
    this.setState(prev => ({ show: !prev.show }))
  }

  render() {
    const className = this.props.relative ? "p-rel" : ""
    return (
      <section className={className}>
        <a onClick={this.toggle} tabIndex={0} className="better-nav-item">
          <span>{this.props.name}</span>
          <Chevron />
        </a>
        <div
          className={
            "box p-absolute direction-column align-items-start mt-1 pr-2 pl-2 pt-3 pb-3" +
            (this.state.show ? " d-flex" : " d-none")
          }>
          {this.props.children}
        </div>
      </section>
    )
  }
}
