import React from 'react'
import { Link } from 'react-router-dom'

import './nav.scss'

class Navbar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      query: '',
      showDropdown: false
    }
  }

  componentWillMount () {
    this.props.fetchData()
    document.addEventListener('mousedown', this.handleGeneralClick)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleGeneralClick)
  }

  handleGeneralClick = e => {
    const clickedInComponent = this.element && this.element.contains(e.target)
    if (clickedInComponent) return
    this.setState({ showDropdown: false })
  }

  toggleDropdown = () => {
    this.setState(prevState => ({ showDropdown: !prevState.showDropdown }))
  }

  logout = () => {
    this.props.logout()
  }

  render () {
    const { avatarURL, loggedIn = true } = this.props
    const { showDropdown } = this.state
    const { toggleDropdown, logout } = this

    const buttons = loggedIn ? (
      <div className="d-flex p-relative">
        <Link to="/recipes/add" className="better-nav-item">Add Recipe</Link>
        <Link to="/recipes" className="better-nav-item">Recipes</Link>
        <Link to="/cart" className="better-nav-item">Cart</Link>
        <div
          ref={element => { this.element = element }}
          onClick={ toggleDropdown }
          className="better-nav-item user-profile d-flex align-center">

          <img alt='' className="user-profile-image" src={ avatarURL }/>

          <div className={ 'dropdown ' + (showDropdown ? 'active' : '')}>
            <ul>
              <li>
                <Link to="/settings" className="dropdown-item">Settings</Link>
              </li>
              <li>
                <a onClick={ logout } className="dropdown-item dropdown-item__dark">Logout</a>
              </li>
            </ul>
          </div>
        </div>
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
