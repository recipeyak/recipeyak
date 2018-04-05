import * as React from 'react'
import {
  Link
} from 'react-router-dom'

import { setDarkModeClass } from '../sideEffects'

import NavLink from '../containers/NavLink'
import Logo from './Logo'
import Dropdown from './Dropdown'
import NotificationsDropdown from './NotificationsDropdown'

import { teamURL } from '../urls'

interface Team {
  id: number
  name: string
}

interface TeamsProps {
  teams: Team[]
  loading: boolean
}

const Teams = ({ teams, loading }: TeamsProps) => {
  if (loading) {
    return <p>Loading...</p>
  }

  if (teams.length === 0) {
    return <p className="text-muted fs-3 align-self-center">No teams.</p>
  }

  return (
    <div className="text-left">
        { teams.map(({ id, name }) =>
            <p key={id}>
              <NavLink to={teamURL(id)} activeClassName="fw-500">{ name }</NavLink>
            </p>)
        }
    </div>
  )
}

interface UserDropdownProps {
  avatarURL: string
  email: string
  toggleDarkMode(): void
  darkMode: boolean
  logout(): void
  loggingOut: boolean
}

interface UserDropdownState {
  show: boolean
}

interface ClickEvent extends Event {
  target: HTMLElement
}

class UserDropdown extends React.Component<UserDropdownProps,UserDropdownState> {
  state = {
    show: false,
  }

  dropdown: HTMLElement

  componentWillMount () {
    document.addEventListener('click', this.handleGeneralClick)
  }

  componentDidMount () {
    setDarkModeClass(this.props.darkMode)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleGeneralClick)
  }

  handleGeneralClick = (e: ClickEvent) => {
    const clickedDropdown = this.dropdown && this.dropdown.contains(e.target)
    if (clickedDropdown) return
    this.setState({ show: false })
  }

  render () {
    const {
      avatarURL,
      email,
      toggleDarkMode,
      darkMode,
      logout,
      loggingOut
    } = this.props
    return (
      <section ref={dropdown => { this.dropdown = dropdown }}>
        <img
          onClick={ () => this.setState(prev => ({ show: !prev.show })) }
          alt=''
          className="user-profile-image better-nav-item p-0"
          src={ avatarURL }/>

          <div className={
            'box p-absolute direction-column align-items-start right-0 mt-1' + (this.state.show ? ' d-flex' : ' d-none')
          }>
            <p className="bold">{ email }</p>
            <div className="d-flex align-center p-1-0">
              <label className="d-flex align-items-center cursor-pointer">
              <input
                onChange={ toggleDarkMode }
                checked={ darkMode }
                type='checkbox' className="mr-2"/>
                Dark Mode
              </label>
            </div>
            <Link to="/settings" className="p-1-0">Settings</Link>
            <button
              onClick={ logout }
              className={ 'my-button w-100' + (loggingOut ? ' is-loading' : '')}>
              Logout
            </button>
          </div>
      </section>
    )
  }
}

interface NavBarProps {
  avatarURL: string
  loggedIn: boolean
  logout(): void
  teams: Team[]
  loadingTeams: boolean
  toggleDarkMode(): void
  darkMode: boolean
  className: string
  loggingOut: boolean
  email: string
  fetchData(): void
}

class Navbar extends React.Component<NavBarProps,{}> {

  static defaultProps = {
    teams: [] as Array<Team>
  }

  componentWillMount () {
    this.props.fetchData()
  }

  render () {
    const {
      avatarURL,
      loggedIn = true,
      logout,
      email,
      loggingOut,
      className = '',
      toggleDarkMode,
      darkMode
    } = this.props

    const buttons = loggedIn ? (
      <div className="d-flex align-center p-relative justify-content-center flex-wrap">
        <NavLink
          to="/recipes/add"
          activeClassName="active"
          className="better-nav-item">
          Add Recipe
        </NavLink>

        <NotificationsDropdown/>

        <Dropdown name="Teams">
            <Teams loading={ this.props.loadingTeams }
                   teams={ this.props.teams }/>
            <Link to="/t/create" className="mt-1 ">Create a Team</Link>
        </Dropdown>

        <NavLink
          to="/recipes"
          activeClassName="active"
          className="better-nav-item">
          Recipes
        </NavLink>
        <NavLink
          to="/cart"
          activeClassName="active"
          className="better-nav-item">
          Cart
        </NavLink>

        <UserDropdown
          avatarURL={avatarURL}
          email={email}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          logout={logout}
          loggingOut={loggingOut}
        />

      </div>
    ) : (
      <div className="d-flex hide-sm">
        <NavLink to="/login" className="better-nav-item">Login</NavLink>
        <NavLink to="/signup" className="better-nav-item">Signup</NavLink>
      </div>
    )

    return (
      <nav className={ `nav flex-wrap pt-2 pb-2 ${className}` }>
        <Link to="/" className="better-nav-item pl-0 pr-0 fs-2rem fw-normal font-family-title">
          <Logo/>
          <span>Recipe Yak</span>
        </Link>
        { buttons }
      </nav>
    )
  }
}

export default Navbar
