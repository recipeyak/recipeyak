import React from "react"
import { Link } from "react-router-dom"

import { setDarkModeClass } from "../sideEffects"

interface IUserDropdownProps {
  readonly darkMode: boolean
  readonly avatarURL: string
  readonly email: string
  readonly toggleDarkMode: () => void
  readonly logout: () => void
  readonly loggingOut: boolean
}

interface IUserDropdownState {
  readonly show: boolean
}
export default class UserDropdown extends React.Component<
  IUserDropdownProps,
  IUserDropdownState
> {
  readonly state = {
    show: false
  }

  componentDidMount() {
    setDarkModeClass(this.props.darkMode)
  }

  readonly handleGeneralClick = () => {
    if (this.state.show) {
      document.removeEventListener("click", this.handleGeneralClick)
    }
    this.setState({ show: false })
  }

  readonly toggle = () => {
    if (this.state.show) {
      document.removeEventListener("click", this.handleGeneralClick)
    } else {
      document.addEventListener("click", this.handleGeneralClick)
    }
    this.setState(prev => ({ show: !prev.show }))
  }

  render() {
    const {
      avatarURL,
      email,
      toggleDarkMode,
      darkMode,
      logout,
      loggingOut
    } = this.props
    return (
      <section>
        <img
          onClick={this.toggle}
          alt=""
          className="user-profile-image better-nav-item p-0"
          src={avatarURL}
        />

        <div
          className={
            "box p-absolute direction-column align-items-start right-0 mt-1" +
            (this.state.show ? " d-flex" : " d-none")
          }>
          <p className="bold">{email}</p>
          <div className="d-flex align-center p-1-0">
            <label className="d-flex align-items-center cursor-pointer">
              <input
                onChange={toggleDarkMode}
                checked={darkMode}
                type="checkbox"
                className="mr-2"
              />
              Dark Mode
            </label>
          </div>
          <Link to="/settings" className="p-1-0">
            Settings
          </Link>
          <button
            onClick={logout}
            className={"my-button w-100" + (loggingOut ? " is-loading" : "")}>
            Logout
          </button>
        </div>
      </section>
    )
  }
}
