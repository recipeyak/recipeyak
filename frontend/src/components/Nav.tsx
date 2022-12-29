import { Link } from "react-router-dom"

import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import {
  DropdownContainer,
  DropdownMenu,
  useDropdown,
} from "@/components/Dropdown"
import Logo from "@/components/Logo"
import { NavLink } from "@/components/Routing"
import { useIsLoggedIn, useTeamId, useUser } from "@/hooks"
import { useAuthLogout } from "@/queries/authLogout"
import { styled } from "@/theme"
import { scheduleURLFromTeamID } from "@/urls"

interface IUserAvatarProps {
  readonly onClick: () => void
  readonly url: string
}
function UserAvatar({ onClick, url }: IUserAvatarProps) {
  return (
    <Avatar
      onClick={onClick}
      tabIndex={0}
      className="better-nav-item p-0"
      avatarURL={url}
    />
  )
}

function LogoutButton() {
  const logoutUser = useAuthLogout()
  return (
    <Button
      onClick={() => {
        logoutUser.mutate()
      }}
      loading={logoutUser.isLoading}
      className="w-100"
    >
      Logout
    </Button>
  )
}

function UserEmail({ email }: { email: string }) {
  return <p className="bold">{email}</p>
}

function UserDropdown() {
  const { ref, toggle, isOpen } = useDropdown()
  const user = useUser()
  return (
    <DropdownContainer ref={ref}>
      <UserAvatar onClick={toggle} url={user.avatarURL} />
      <DropdownMenu isOpen={isOpen} position="right">
        <UserEmail email={user.email} />
        <p>
          <Link to="/settings" className="p-1-0">
            Settings
          </Link>
        </p>
        <p>
          <Link to="/t" className="p-1-0">
            Teams
          </Link>
        </p>

        <LogoutButton />
      </DropdownMenu>
    </DropdownContainer>
  )
}

const WordMarkContainer = styled.span`
  font-size: 1.5rem;
  @media (max-width: ${(p) => p.theme.small}) {
    display: none;
  }
`

function WordMark() {
  return <WordMarkContainer>Recipe Yak</WordMarkContainer>
}

function AuthButtons() {
  return (
    <div className="d-flex">
      <NavLink to="/login" className="better-nav-item">
        Login
      </NavLink>
      <NavLink to="/signup" className="better-nav-item">
        Signup
      </NavLink>
    </div>
  )
}

function NavButtons() {
  const teamId = useTeamId()
  const scheduleURL = scheduleURLFromTeamID(teamId)
  return (
    <div className="d-flex align-center p-relative justify-content-center flex-wrap">
      <DropdownContainer>
        <div className="d-flex">
          <NavLink
            to="/recipes/add"
            activeClassName="active"
            className="better-nav-item"
          >
            Add
          </NavLink>
          <NavLink
            to="/recipes"
            activeClassName="active"
            className="better-nav-item"
          >
            Browse
          </NavLink>
          <NavLink
            to={scheduleURL}
            activeClassName="active"
            className="better-nav-item"
          >
            Calendar
          </NavLink>
        </div>
      </DropdownContainer>

      <UserDropdown />
    </div>
  )
}

const NavContainer = styled.nav`
  flex-wrap: 1;
  margin-bottom: 0.25rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
  height: 3rem;
`

export function Navbar() {
  const isLoggedIn = useIsLoggedIn()
  return (
    <NavContainer>
      <Link to="/" className="better-nav-item pb-1 pt-1 pl-0 pr-0 fw-normal">
        <Logo width="40px" />
        {isLoggedIn ? (
          <span className="ml-2 fw-500 sm:d-none">Home</span>
        ) : (
          <WordMark />
        )}
      </Link>
      {isLoggedIn ? <NavButtons /> : <AuthButtons />}
    </NavContainer>
  )
}
