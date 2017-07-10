import React from 'react'
import PropTypes from 'prop-types'

import Navbar from './Nav.jsx'
import Recipe from './RecipeItem.jsx'

import 'bulma/css/bulma.css'

import './recipe-list.scss'

const RecipeList = ({ recipes = [], removeFromCart, addToCart }) => {
  recipes = recipes.map(recipe =>
    <div className="grid-item" key={ recipe.id }>
      <Recipe
        {...recipe}
        key={ recipe.id }
        removeFromCart={ () => removeFromCart(recipe.id)}
        addToCart={ () => addToCart(recipe.id)}
      />
    </div>)

  const recipeList = recipes.length !== 0
    ? <div className="grid-container">{ recipes }</div>
    : <div className="no-recipes">No Recipes☹️</div>

  return (
    <div className="container">
      <Navbar/>
      <section className="section">
        { recipeList }
      </section>
    </div>
  )
}

RecipeList.PropTypes = {
  recipes: PropTypes.array.isRequired,
  removeFromCart: PropTypes.func.isRequired,
  addToCart: PropTypes.func.isRequired,
}

export default RecipeList
