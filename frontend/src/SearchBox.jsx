import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

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

const SearchBox = ({
  showSearchResults = false,
  handleOnFocus,
  handleOnBlur,
  results = [],
}) => (
  <div className="search-container">
    <p className="search-box-container control field nav-item ">
      <input
         onFocus={ () => handleOnFocus() }
         onBlur={ () => handleOnBlur() }
         className="input"
         type="text"
         placeholder="Search..."
       />
    </p>

    { showSearchResults && SearchResults(results) }

  </div>
)

SearchBox.PropTypes = {
  showSearchResults: PropTypes.bool,
  handleOnFocus: PropTypes.func,
  handleOnBlur: PropTypes.func,
  results: PropTypes.array,
}

export default SearchBox
