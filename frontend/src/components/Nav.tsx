import { useQueryClient } from "@tanstack/react-query"
import { Link, useHistory } from "react-router-dom"

import { Avatar } from "@/components/Avatar"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import {
  DropdownContainer,
  DropdownMenu,
  useDropdown,
} from "@/components/Dropdown"
import { Select } from "@/components/Forms"
import Logo from "@/components/Logo"
import { NavLink } from "@/components/Routing"
import { useIsLoggedIn, useTeamId, useUser } from "@/hooks"
import { useAuthLogout } from "@/queries/authLogout"
import { useTeamList } from "@/queries/teamList"
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
      size="small"
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

function TeamSelect() {
  const queryClient = useQueryClient()
  const history = useHistory()
  const value = useTeamId()

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamID = parseInt(e.target.value, 10)
    // TODO: instead of navigating to the schedule page we should update the
    // path param of the current route if there is a teamID in it.
    // Maybe we can get rid of the teamID from the URL entirely?
    const url = `/t/${teamID}/schedule`
    // navTo is async so we can't count on the URL to have changed by the time we refetch the data
    history.push(url)
    // TODO: we should abstract this -- it's hacky
    void queryClient.invalidateQueries([teamID])
    void queryClient.invalidateQueries(["user-detail"])
  }
  const teams = useTeamList()
  return (
    <Select
      onChange={onChange}
      value={value}
      size="small"
      disabled={teams.isLoading}
    >
      {teams.isSuccess
        ? teams.data.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))
        : null}
    </Select>
  )
}

function UserDropdown() {
  const { ref, toggle, isOpen } = useDropdown()
  const user = useUser()

  return (
    <DropdownContainer ref={ref}>
      <UserAvatar onClick={toggle} url={user.avatarURL} />
      <DropdownMenu isOpen={isOpen} position="right">
        <UserEmail email={user.email} />
        <TeamSelect />
        <Link to="/settings">Settings</Link>
        <Link to="/t">Teams</Link>
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
