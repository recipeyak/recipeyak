import React from 'react'
import { Link } from 'react-router-dom'

import './nav.scss'

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
        <Link to="/recipes/add" className="better-nav-item">Add Recipe</Link>
        <Link to="/recipes" className="better-nav-item">Recipes</Link>
        <Link to="/cart" className="better-nav-item">Cart</Link>
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
      <nav className="nav justify-space-between flex-wrap">
        <Link to="/" className="better-nav-item pl-0 pr-0 fs-2rem fw-normal">Recipe Yak</Link>
        { buttons }
      </nav>
    )
  }
}

export default Navbar
