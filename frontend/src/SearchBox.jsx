import React from 'react'
import PropTypes from 'prop-types'

import SearchResult from './SearchResult.jsx'

import './SearchBox.scss'

const SearchRecipes = (recipes, query) =>
  Object.keys(recipes)
    .map(recipeID => recipes[recipeID])
    .filter(recipe =>
      recipe.author.toUpperCase().includes(query.toUpperCase()) ||
      recipe.name.toUpperCase().includes(query.toUpperCase())
    )

const SearchBox = ({
  showSearchResults,
  handleOnFocus,
  recipes = {},
  cart = {},
  removeFromCart,
  addToCart,
  handleQueryChange,
  query,
}) => {
  const results = SearchRecipes(recipes, query)

  const resultLimit = 7

  const searchResults =
    results
    .slice(0, resultLimit)
    .map(recipe =>
      <SearchResult
        key={ recipe.id }
        { ...recipe }
        removeFromCart={ removeFromCart }
        addToCart={ addToCart }
        cart={ cart }
      />
    )

  return (
    <div className="search-container">
      <p className="search-box-container control field nav-item">
        <input
          onFocus={ () => handleOnFocus() }
          onChange={ (e) => handleQueryChange(e) }
          className="input"
          type="search"
          placeholder="Search..."
        />
      </p>

      { showSearchResults &&
        <ul className="search-results">
          { results.length > 0
              ? searchResults
              : <li className="no-results">
                  No results for <strong>{ query }</strong>
                </li>
          }
        </ul>
      }

    </div>
  )
}

SearchBox.PropTypes = {
  showSearchResults: PropTypes.bool,
  handleOnFocus: PropTypes.func,
  handleOnBlur: PropTypes.func,
  results: PropTypes.array,
  query: PropTypes.string,
}

export default SearchBox
