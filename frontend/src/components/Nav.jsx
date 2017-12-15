import React from 'react'
import {
  Link
} from 'react-router-dom'

import NavLink from '../containers/NavLink.jsx'

class Navbar extends React.Component {
  state = {
    query: '',
    showDropdown: false
  }

  componentWillMount = () => {
    this.props.fetchData()
  }

  render () {
    const { avatarURL, loggedIn = true, navigateTo } = this.props

    const buttons = loggedIn ? (
      <div className="d-flex align-center">
        <NavLink
          to="/recipes/add"
          activeClassName="active"
          className="better-nav-item">
          Add Recipe
        </NavLink>
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
        <img
          onClick={ () => navigateTo('/settings') }
          alt=''
          className="user-profile-image better-nav-item p-0"
          src={ avatarURL }/>
      </div>
    ) : (
      <div className="d-flex">
        <Link to="/login" className="better-nav-item">Login</Link>
        <Link to="/signup" className="better-nav-item">Signup</Link>
      </div>
    )

    return (
      <nav className="nav flex-wrap pt-2 pb-2">
        <Link to="/" className="better-nav-item pl-0 pr-0 fs-2rem fw-normal font-family-title">Recipe Yak</Link>
        { buttons }
      </nav>
    )
  }
}

export default Navbar
