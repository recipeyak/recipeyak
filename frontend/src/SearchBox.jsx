import React from 'react'
import PropTypes from 'prop-types'

import SearchResult from './SearchResult.jsx'

const SearchBox = ({
  showSearchResults,
  handleOnFocus,
  recipes = {},
  cart = {},
  removeFromCart,
  addToCart,
  handleQueryChange,
}) => (
  <div className="search-container">
    <p className="search-box-container control field nav-item">
      <input
        onFocus={ () => handleOnFocus() }
        onChange={ () => handleQueryChange() }
        className="input"
        type="search"
        placeholder="Search..."
      />
    </p>

    { showSearchResults &&
      <ul className="search-results">
        { Object.keys(recipes)
            .map(recipeID =>
              <SearchResult
                key={ recipeID }
                { ...recipes[recipeID] }
                removeFromCart={ removeFromCart }
                addToCart={ addToCart }
                cart={ cart }
              />
            )
        }
      </ul>
    }

  </div>
)

SearchBox.PropTypes = {
  showSearchResults: PropTypes.bool,
  handleOnFocus: PropTypes.func,
  handleOnBlur: PropTypes.func,
  results: PropTypes.array,
}

export default SearchBox
