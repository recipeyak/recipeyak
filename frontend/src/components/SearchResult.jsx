import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import './SearchResult.scss'

const SearchResult = ({ name, url, id, cart, removeFromCart, addToCart }) => {
  const inCart = cart[id] > 0 ? cart[id] : 0
  return (
    <li key={ id } className="search-result">
      <Link to={ url }>
        <h1>{ name }</h1>
      </Link>
      {
        <div className="field has-addons">
          <p className="control">
            <button
              onClick={ () => removeFromCart(id) }
              disabled={ inCart === 0 }
              className="button">
              <span>-</span>
            </button>
          </p>
          <p className="control">
            <span className="ticker--inner">
              { inCart }
            </span>
          </p>
          <p className="control">
            <button
              onClick={ () => addToCart(id) }
              className="button">
              <span>+</span>
            </button>
          </p>
        </div>
      }

    </li>
  )
}

SearchResult.PropTypes = {
  showSearchResults: PropTypes.bool,
  handleOnFocus: PropTypes.func,
  handleOnBlur: PropTypes.func,
  results: PropTypes.array,
}

export default SearchResult
