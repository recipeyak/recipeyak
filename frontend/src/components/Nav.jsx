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
    return (
      <nav className="nav justify-space-between flex-wrap">
        <div className="nav-item pl-0 pr-0">
          <Link to="/" className="title">Recipe Yak</Link>
        </div>

        <div className="d-flex p-relative">
        <div className="nav-item">
          <div className="field is-grouped">
            <p className="control">
              <Link to="/recipes/add" className="button is-primary">Add Recipe</Link>
            </p>
          </div>
        </div>
        <Link to="/recipes" className="nav-item">Recipes</Link>
        <Link to="/cart" className="nav-item">Cart</Link>
        <div
          ref={element => { this.element = element }}
          onClick={ this.toggleDropdown }
          className="nav-item user-profile">

          <img alt='' className="user-profile-image" src={ this.props.avatarURL }/>

          <div className={ 'dropdown ' + (this.state.showDropdown ? 'active' : '')}>
            <ul>
              <li>
                <Link to="/settings" className="dropdown-item">Settings</Link>
              </li>
              <li>
                <a onClick={ this.logout } className="dropdown-item dropdown-item__dark ">Logout</a>
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
