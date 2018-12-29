import React from "react"

const Chevron = () => (
  <svg
    style={{ width: "1.5em" }}
    className="fill-text-color"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg">
    <g>
      <path
        fill="inherit"
        d="M14.1711599,9.3535 L9.99925636,13.529 L5.82735283,9.3535 C5.51262415,9.0385 5.73543207,8.5 6.18054835,8.5 L13.8179644,8.5 C14.2630807,8.5 14.4858886,9.0385 14.1711599,9.3535"
      />
    </g>
  </svg>
)

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
