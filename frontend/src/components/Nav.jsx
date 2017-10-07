import React from 'react'
import { Link, NavLink } from 'react-router-dom'

import './nav.scss'

class Navbar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      query: '',
      showNav: false,
      showDropdown: false,
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

  toggleNav = () => {
    this.setState(prevState => ({ showNav: !prevState.showNav }))
  }

  toggleDropdown = () => {
    this.setState(prevState => ({ showDropdown: !prevState.showDropdown }))
  }

  logout = () => {
    this.props.logout()
  }

  render () {
    return (
      <nav className="nav">
      <div className="nav-left">
        <div className="nav-item">
          <Link to="/" className="title">Recipe Yak</Link>
        </div>
      </div>

      <span onClick={ this.toggleNav } className={ 'nav-toggle' + (this.state.showNav ? ' is-active' : '') }>
        <span></span>
        <span></span>
        <span></span>
      </span>

      <div className={ 'overflow-initial nav-right nav-menu' + (this.state.showNav ? ' is-active' : '') }>
        <div className="nav-item">
          <div className="field is-grouped">
            <p className="control">
              <Link to="/recipes/add" className="button is-primary">Add Recipe</Link>
            </p>
          </div>
        </div>
        <NavLink activeClassName="is-active" to="/recipes" className="nav-item">Recipes</NavLink>
        <NavLink activeClassName="is-active" to="/cart" className="nav-item">Cart</NavLink>
        <div
          ref={element => { this.element = element }}
          onClick={ this.toggleDropdown }
          className="nav-item user-profile">
          <img alt="user profile" className="user-profile-image" src={ this.props.avatarURL }/>

          <div className={ 'dropdown ' + (this.state.showDropdown ? 'active' : '')}>
            <ul>
              <li>
                <Link to="/settings" className="nav-item">Settings</Link>
              </li>
              <li>
                <a onClick={ this.logout } className="nav-item">Logout</a>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </nav>
    )
  }
}

export default Navbar
