import React from 'react'
import { Link, NavLink } from 'react-router-dom'

import './nav.scss'

const SearchResult = ({ title, URL, inCart }) => (
  <li key={ title } className="search-result">
    <Link to={ URL }>
      <h1>{ title }</h1>
    </Link>
    {
      inCart
      ? <input type="button" className="button" value="- Remove from Cart"/>
      : <input type="button" className="button" value="+ Add to Cart"/>
    }
  </li>
)

const SearchResults = (recipes) => (
  <ul className="search-results">
    { recipes.map(x => SearchResult(x)) }
  </ul>
)

const recipes = [
  {
    title: 'Durban Chicken',
    URL: '/recipe/1',
    inCart: true,
  },
  {
    title: 'Tomato and Red Bean Salad',
    URL: '/recipe/2',
    inCart: false,
  },
]

const results = SearchResults(recipes)

class Navbar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showNav: false,
      showSearchResults: false,
      showDropdown: false,
    }
  }

  toggleNav () {
    this.setState((prevState, props) => ({ showNav: !prevState.showNav }))
  }

  toggleDropdown () {
    this.setState((prevState, props) => ({ showDropdown: !prevState.showDropdown }))
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
          <div className="search-container">
            <p className="search-box-container control field nav-item ">
              <input onFocus={ () => this.setState({ showSearchResults: true }) }
                     onBlur={ () => this.setState({ showSearchResults: false }) }
                     className="input"
                     type="text"
                     placeholder="Search..."/>
            </p>

            { this.state.showSearchResults && results }

          </div>
      </div>

      <span onClick={ () => this.toggleNav() } className={ 'nav-toggle' + (this.state.showNav ? ' is-active' : '') }>
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
        <div onClick={() => this.toggleDropdown() } className="nav-item user-profile">
          <img alt="user profile" className="user-profile-image" src="https://www.gravatar.com/avatar/ea7be1e5200ad6934add15a721b5b1b0?d=identicon"/>
          <svg aria-hidden="true" height="11" version="1.1" viewBox="0 0 12 16" width="8">
            <path d="M0 5l6 6 6-6z"></path>
          </svg>

          <div className={ 'dropdown ' + (this.state.showDropdown ? 'active' : '')}>
            <ul>
              <li>
                <Link to="/settings" className="nav-item">Settings</Link>
              </li>
              <li>
                <Link to="/login" className="nav-item">Logout</Link>
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
