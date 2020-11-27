import React from "react"
import { Link } from "react-router-dom"

import NavLink from "@/containers/NavLink"
import Logo from "@/components/Logo"
import { NotificationsDropdown } from "@/components/NotificationsDropdown"
import { UserDropdown } from "@/components/UserDropdown"

import { teamURL } from "@/urls"
import { styled } from "@/theme"
import {
  DropdownContainer,
  useDropdown,
  DropdownMenu,
} from "@/components/Dropdown"
import { Chevron } from "@/components/icons"
import { lighten } from "polished"
import { useSelector, useDispatch } from "@/hooks"
import { scheduleURLFromTeamID, teamsFrom } from "@/store/mapState"
import { fetchingTeamsAsync, fetchingUserAsync } from "@/store/thunks"
import { Loading, Success, isLoading, isFailure, isInitial } from "@/webdata"

const WordMarkContainer = styled.span`
  font-size: 1.5rem;
  @media (max-width: ${p => p.theme.small}) {
    display: none;
  }
`

function WordMark() {
  return <WordMarkContainer>Recipe Yak</WordMarkContainer>
}

function useTeams() {
  const dispatch = useDispatch()
  React.useEffect(() => {
    fetchingTeamsAsync(dispatch)()
  }, [dispatch])
  const loading = useSelector(
    s => s.teams.status === "loading" || s.teams.status === "initial",
  )
  const teams = useSelector(teamsFrom)
  if (loading) {
    return Loading()
  }
  return Success(teams)
}

function Teams() {
  const teams = useTeams()
  if (isLoading(teams) || isInitial(teams)) {
    return <p>Loading...</p>
  }

  if (isFailure(teams)) {
    return <p>failure loading</p>
  }

  if (teams.data.length === 0) {
    return <p className="text-muted text-small align-self-center">No teams.</p>
  }

  return (
    <div className="text-left">
      {teams.data.map(({ id, name }) => (
        <p key={id}>
          <NavLink to={teamURL(id, name)} activeClassName="fw-500">
            {name}
          </NavLink>
        </p>
      ))}
    </div>
  )
}

interface INavButtonContainerProps {
  readonly show: boolean
}

const NavButtonContainer = styled.div<INavButtonContainerProps>`
  display: flex;
  @media (max-width: ${p => p.theme.small}) {
    z-index: 1000;
    display: ${p => (p.show ? "block" : "none")};
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
  @media (max-width: ${p => p.theme.small}) {
    display: flex;
  }
`

function TeamsDropdown() {
  const { ref, toggle, isOpen } = useDropdown()
  return (
    <DropdownContainer ref={ref}>
      <a onClick={toggle} tabIndex={0} className="better-nav-item">
        <span>Teams</span>
        <Chevron />
      </a>
      <DropdownMenu isOpen={isOpen}>
        <Teams />
        <Link to="/t/create" className="mt-1 ">
          Create a Team
        </Link>
      </DropdownMenu>
    </DropdownContainer>
  )
}

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
    <div className="d-flex hide-sm">
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
  const scheduleURL = useSelector(scheduleURLFromTeamID)
  const { ref, isOpen, close, toggle } = useDropdown()
  return (
    <div className="d-flex align-center p-relative justify-content-center flex-wrap">
      <DropdownContainer ref={ref}>
        <DropDownButton onClick={toggle} />
        <NavButtonContainer show={isOpen}>
          <NavLink
            to="/recipes/add"
            onClick={close}
            activeClassName="active"
            className="better-nav-item">
            Add
          </NavLink>
          <TeamsDropdown />
          <NotificationsDropdown />
          <NavLink
            to="/recipes"
            onClick={close}
            activeClassName="active"
            className="better-nav-item">
            Browse
          </NavLink>
          <NavLink
            to={scheduleURL}
            onClick={close}
            activeClassName="active"
            className="better-nav-item">
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
    fetchingUserAsync(dispatch)()
  }, [dispatch])
  return useSelector(s => s.user.loggedIn)
}

const NavContainer = styled.nav`
  flex-wrap: 1;
  margin-bottom: 0.25rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
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
