import React from 'react'
import { Link, NavLink } from 'react-router-dom'

import './nav.scss'

const RecipeItem = ({ title, URL, inCart }) => (
  <li className="search-result" key="title">
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
    { recipes.map(x => RecipeItem(x)) }
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
    }
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

      <div className={ 'nav-right nav-menu' + (this.state.showNav ? ' is-active' : '') }>
        <NavLink activeClassName="is-active" to="/recipes" className="nav-item">Recipes</NavLink>
        <NavLink activeClassName="is-active" to="/cart" className="nav-item">Cart</NavLink>
        <NavLink activeClassName="is-active" to="/login" className="nav-item">Logout</NavLink>

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
