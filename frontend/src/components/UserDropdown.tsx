import React from "react"
import { Link } from "react-router-dom"

import { setDarkModeClass } from "@/sideEffects"
import { Button } from "@/components/Buttons"
import { CheckBox } from "@/components/Forms"
import { useSelector, useDispatch } from "@/hooks"
import { toggleDarkMode as toggleDarkModeAction } from "@/store/reducers/user"
import { loggingOutAsync } from "@/store/thunks"
import {
  DropdownContainer,
  DropdownMenu,
  useDropdown
} from "@/components/Dropdown"

function useDarkMode(): [boolean, () => void] {
  const dispatch = useDispatch()
  const darkMode = useSelector(s => s.user.darkMode)
  const toggle = React.useCallback(() => {
    dispatch(toggleDarkModeAction())
  }, [dispatch])
  return [darkMode, toggle]
}

interface IUserAvatarProps {
  readonly onClick?: () => void
}
function UserAvatar({ onClick }: IUserAvatarProps) {
  const avatarURL = useSelector(s => s.user.avatarURL)
  return (
    <img
      onClick={onClick}
      alt=""
      tabIndex={0}
      className="user-profile-image better-nav-item p-0"
      src={avatarURL}
    />
  )
}

function DarkModeToggle() {
  const [darkMode, toggleDarkMode] = useDarkMode()

  React.useEffect(() => {
    setDarkModeClass(darkMode)
  }, [darkMode])
  return (
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
  )
}

function LogoutButton() {
  const loggingOut = useSelector(s => s.user.loggingOut)
  const dispatch = useDispatch()
  const logout = React.useCallback(() => {
    loggingOutAsync(dispatch)()
  }, [dispatch])
  return (
    <Button onClick={logout} loading={loggingOut} className="w-100">
      Logout
    </Button>
  )
}

function UserEmail() {
  const email = useSelector(s => s.user.email)
  return <p className="bold">{email}</p>
}

export function UserDropdown() {
  const { ref, toggle, isOpen } = useDropdown()
  return (
    <DropdownContainer ref={ref}>
      <UserAvatar onClick={toggle} />
      <DropdownMenu isOpen={isOpen}>
        <UserEmail />
        <DarkModeToggle />
        <p>
          <Link to="/settings" className="p-1-0">
            Settings
          </Link>
        </p>
        <LogoutButton />
      </DropdownMenu>
    </DropdownContainer>
  )
}
