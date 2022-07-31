import React from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { useSelector, useDispatch } from "@/hooks"
import { loggingOutAsync } from "@/store/thunks"
import {
  DropdownContainer,
  DropdownMenu,
  useDropdown,
} from "@/components/Dropdown"
import { Avatar } from "@/components/Avatar"

interface IUserAvatarProps {
  readonly onClick?: () => void
}
function UserAvatar({ onClick }: IUserAvatarProps) {
  const avatarURL = useSelector((s) => s.user.avatarURL)
  return (
    <Avatar
      onClick={onClick}
      tabIndex={0}
      className="better-nav-item p-0"
      avatarURL={avatarURL}
    />
  )
}

function LogoutButton() {
  const loggingOut = useSelector((s) => s.user.loggingOut)
  const dispatch = useDispatch()
  const logout = React.useCallback(() => {
    void loggingOutAsync(dispatch)()
  }, [dispatch])
  return (
    <Button onClick={logout} loading={loggingOut} className="w-100">
      Logout
    </Button>
  )
}

function UserEmail() {
  const email = useSelector((s) => s.user.email)
  return <p className="bold">{email}</p>
}

export function UserDropdown() {
  const { ref, toggle, isOpen } = useDropdown()
  return (
    <DropdownContainer ref={ref}>
      <UserAvatar onClick={toggle} />
      <DropdownMenu isOpen={isOpen}>
        <UserEmail />
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
