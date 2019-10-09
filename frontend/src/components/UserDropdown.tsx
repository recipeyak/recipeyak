import React, { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"

import { setDarkModeClass } from "@/sideEffects"
import { Button } from "@/components/Buttons"
import { CheckBox } from "@/components/Forms"

interface IUserDropdownProps {
  readonly darkMode: boolean
  readonly avatarURL: string
  readonly email: string
  readonly toggleDarkMode: () => void
  readonly logout: () => void
  readonly loggingOut: boolean
}

export default function UserDropdown(props: IUserDropdownProps) {
  const [show, setShow] = useState(false)

  const handleGeneralClick = useCallback(() => setShow(false), [])

  useEffect(() => {
    setDarkModeClass(props.darkMode)
    return () => {
      document.removeEventListener("click", handleGeneralClick)
    }
  }, [handleGeneralClick, props.darkMode])

  useEffect(() => {
    if (show) {
      document.addEventListener("click", handleGeneralClick)
    } else {
      document.removeEventListener("click", handleGeneralClick)
    }
  }, [handleGeneralClick, show])

  const toggle = () => setShow(prevShow => !prevShow)

  const {
    avatarURL,
    email,
    toggleDarkMode,
    darkMode,
    logout,
    loggingOut
  } = props
  return (
    <section>
      <img
        onClick={toggle}
        alt=""
        tabIndex={0}
        className="user-profile-image better-nav-item p-0"
        src={avatarURL}
      />

      <div
        className={
          "box p-absolute direction-column align-items-start right-0 mt-1" +
          (show ? " d-flex" : " d-none")
        }>
        <p className="bold">{email}</p>
        <div className="d-flex align-center p-1-0">
          <label className="d-flex align-items-center cursor-pointer">
            <CheckBox
              onChange={toggleDarkMode}
              checked={darkMode}
              className="mr-2"
            />
            Dark Mode
          </label>
        </div>
        <Link to="/settings" className="p-1-0">
          Settings
        </Link>
        <Button onClick={logout} loading={loggingOut} className="w-100">
          Logout
        </Button>
      </div>
    </section>
  )
}
