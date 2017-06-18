import React from 'react'
import { Link } from 'react-router-dom'

class Navbar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {showNav: false}

    // This binding is necessary to make `this` work in the callback
    // See https://facebook.github.io/react/docs/handling-events.html
    this.toggleNav = this.toggleNav.bind(this)
  }
  toggleNav () {
    this.setState((prevState, props) => ({showNav: !prevState.showNav}))
  }
  render () {
    return (
      <nav className="nav">
      <div className="nav-left">
        <div className="nav-item">
          <Link to="/" className="title">Caena</Link>
        </div>
      </div>
      <div className="nav-center">
          <p className="control field nav-item">
            <input className="input" type="text" placeholder="Search..."/>
          </p>
      </div>

      <span onClick={ this.toggleNav } className={ 'nav-toggle' + (this.state.showNav ? ' is-active' : '') }>
        <span></span>
        <span></span>
        <span></span>
      </span>

      <div className={ 'nav-right nav-menu' + (this.state.showNav ? ' is-active' : '') }>
        <Link to="/recipes/" className="nav-item">Recipes</Link>
        <Link to="/cart" className="nav-item">Cart</Link>
        <Link to="/login" className="nav-item">Logout</Link>

        <div className="nav-item">
          <div className="field is-grouped">
            <p className="control">
              <a className="button is-primary">Add Recipe</a>
            </p>
          </div>
        </div>
      </div>
    </nav>
    )
  }
}

export default Navbar
