import React from 'react'
import {
  Link
} from 'react-router-dom'

import { setDarkModeClass } from '../sideEffects'

import NavLink from '../containers/NavLink'
import Logo from './Logo'

import { teamURL } from '../urls'

const Teams = ({ teams, loading }) => {
  if (loading) {
    return <p>Loading...</p>
  }

  if (teams.length === 0) {
    return <p className="text-muted fs-3 align-self-center">No teams.</p>
  }

  return (
    <div>
        { teams.map(({ id, name }) =>
            <p key={id}>
              <Link to={teamURL(id)}>{ name }</Link>
            </p>)
        }
    </div>
  )
}

class Navbar extends React.Component {
  state = {
    query: '',
    showUserDropdown: false,
    showNotificationsDropdown: false,
    showTeamsDropdown: false,
  }

  static defaultProps = {
    teams: []
  }

  componentWillMount = () => {
    this.props.fetchData()
    document.addEventListener('click', this.handleGeneralClick)
  }

  componentDidMount = () => {
    setDarkModeClass(this.props.darkMode)
  }

  componentWillUnmount = () => {
    document.removeEventListener('click', this.handleGeneralClick)
  }

  handleGeneralClick = e => {
    const clickedInNotificationsDropdown = this.notificationsDropdown && this.notificationsDropdown.contains(e.target)
    const clickedInTeamsDropdown = this.teamsDropdown && this.teamsDropdown.contains(e.target)
    const clickedInUserDropdown = this.userDropdown && this.userDropdown.contains(e.target)
    const clickedOnLink = e.target.nodeName === 'A'

    const data = {
      showUserDropdown: false,
      showNotificationsDropdown: false,
      showTeamsDropdown: false,
    }
    if (clickedInNotificationsDropdown) {
      delete data.showNotificationsDropdown
    }
    if (clickedInTeamsDropdown) {
      delete data.showTeamsDropdown
    }
    if (clickedInUserDropdown) {
      // Needed to make clicking inputs work
      if (!clickedOnLink) { return }
      delete data.showUserDropdown
    }
    this.setState(data)
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
      <div className="d-flex align-center p-relative">
        <NavLink
          to="/recipes/add"
          activeClassName="active"
          className="better-nav-item">
          Add Recipe
        </NavLink>

        <section ref={notificationsDropdown => { this.notificationsDropdown = notificationsDropdown }}>
          <a
            onClick={ () => this.setState(prev => ({ showNotificationsDropdown: !prev.showNotificationsDropdown })) }
            className="better-nav-item">Notifications</a>
          <div className={
            'box p-absolute direction-column align-items-start mt-1 pr-2 pl-2 pt-3 pb-3' + (this.state.showNotificationsDropdown ? ' d-flex' : ' d-none')
          }>
            <p className="text-muted fs-3 align-self-center">No new notifications.</p>
            <Link to="/notifications" className="mt-1 ">See All Notifications</Link>
          </div>
        </section>

        <section ref={teamsDropdown => { this.teamsDropdown = teamsDropdown }}>
          <a
            onClick={ () => this.setState(prev => ({ showTeamsDropdown: !prev.showTeamsDropdown })) }
            className="better-nav-item">Teams</a>
          <div className={
            'box p-absolute direction-column align-items-start mt-1 pr-2 pl-2 pt-3 pb-3' + (this.state.showTeamsDropdown ? ' d-flex' : ' d-none')
          }>

            <Teams loading={ this.props.loadingTeams }
                   teams={ this.props.teams }/>

            <Link to="/t/create" className="mt-1 ">Create a Team</Link>
          </div>
        </section>

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
        <section ref={userDropdown => { this.userDropdown = userDropdown }}>
          <img
            onClick={ () => this.setState(prev => ({ showUserDropdown: !prev.showUserDropdown })) }
            alt=''
            className="user-profile-image better-nav-item p-0"
            src={ avatarURL }/>
          <div className={
            'box p-absolute direction-column align-items-start right-0 mt-1' + (this.state.showUserDropdown ? ' d-flex' : ' d-none')
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
