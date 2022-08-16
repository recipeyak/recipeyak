import { lighten } from "polished"
import React from "react"
import { Link } from "react-router-dom"

import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import {
  DropdownContainer,
  DropdownMenu,
  useDropdown,
} from "@/components/Dropdown"
import { Chevron } from "@/components/icons"
import Logo from "@/components/Logo"
import { NavLink } from "@/components/Routing"
import { useDispatch, useSelector } from "@/hooks"
import { scheduleURLFromTeamID } from "@/store/mapState"
import { fetchingUserAsync, loggingOutAsync } from "@/store/thunks"
import { styled } from "@/theme"

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

function UserDropdown() {
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

const WordMarkContainer = styled.span`
  font-size: 1.5rem;
  @media (max-width: ${(p) => p.theme.small}) {
    display: none;
  }
`

function WordMark() {
  return <WordMarkContainer>Recipe Yak</WordMarkContainer>
}

interface INavButtonContainerProps {
  readonly show: boolean
}

const NavButtonContainer = styled.div<INavButtonContainerProps>`
  display: flex;
  @media (max-width: ${(p) => p.theme.small}) {
    z-index: 1000;
    display: ${(p) => (p.show ? "block" : "none")};
    position: absolute;
    background-color: white;
    border: 1px solid lightgray;
    top: 100%;
    right: 0;
  }
`

const DropDownButtonContainer = styled.a`
  align-items: center;
  flex-grow: 0;
  flex-shrink: 0;
  font-size: 1rem;
  justify-content: center;
  line-height: 1.5;
  padding: 0.5rem 0.75rem;
  font-weight: 500;
  color: #4a4a4a;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.1s;
  &:hover {
    color: ${lighten(0.15)("#4a4a4a")};
    text-decoration: underline;
  }

  &:active {
    transform: translateY(1px);
  }

  &.active {
    text-decoration: underline;
  }

  display: none;
  @media (max-width: ${(p) => p.theme.small}) {
    display: flex;
  }
`

interface IDropDownButtonProps {
  readonly onClick: () => void
}
function DropDownButton({ onClick }: IDropDownButtonProps) {
  return (
    <DropDownButtonContainer onClick={onClick}>
      Menu <Chevron />
    </DropDownButtonContainer>
  )
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

function IconThreeDots() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  )
}

function MoreDropdown() {
  const { ref, toggle, isOpen, close } = useDropdown()
  return (
    <DropdownContainer ref={ref} className="d-flex justify-content-center">
      <a onClick={toggle} tabIndex={0} className="better-nav-item">
        <IconThreeDots />
      </a>
      <DropdownMenu isOpen={isOpen} style={{ top: 30 }}>
        <NavLink
          to="/t/"
          onClick={close}
          activeClassName="active"
          className="better-nav-item"
        >
          Teams
        </NavLink>
      </DropdownMenu>
    </DropdownContainer>
  )
}

function NavButtons() {
  const scheduleURL = useSelector(scheduleURLFromTeamID)
  const { ref, isOpen, close, toggle } = useDropdown()
  return (
    <div className="d-flex align-center p-relative justify-content-center flex-wrap">
      <DropdownContainer ref={ref}>
        <DropDownButton onClick={toggle} />
        <NavButtonContainer show={isOpen}>
          <MoreDropdown />

          <NavLink
            to="/recipes/add"
            onClick={close}
            activeClassName="active"
            className="better-nav-item"
          >
            Add
          </NavLink>
          <NavLink
            to="/recipes"
            onClick={close}
            activeClassName="active"
            className="better-nav-item"
          >
            Browse
          </NavLink>
          <NavLink
            to={scheduleURL}
            onClick={close}
            activeClassName="active"
            className="better-nav-item"
          >
            Schedule
          </NavLink>
        </NavButtonContainer>
      </DropdownContainer>

      <UserDropdown />
    </div>
  )
}

function useIsLoggedIn(): boolean {
  const dispatch = useDispatch()
  React.useEffect(() => {
    void fetchingUserAsync(dispatch)()
  }, [dispatch])
  return useSelector((s) => s.user.loggedIn)
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
        <WordMark />
      </Link>
      {isLoggedIn ? <NavButtons /> : <AuthButtons />}
    </NavContainer>
  )
}
