import React from 'react'
import PropTypes from 'prop-types'
import { recipeType } from './propTypes.js'

import Navbar from './Nav.jsx'
import Recipe from './RecipeItem.jsx'

import 'bulma/css/bulma.css'

const RecipeList = props => {
  let recipeList = props.recipes.map(recipe =>
    <div className="grid-item" key={ recipe.id }>
      <Recipe
        {...recipe}
        key={ recipe.id }
        removeFromCart={ () => props.removeFromCart(recipe.id)}
        addToCart={ () => props.addToCart(recipe.id)}
      />
    </div>
  )
  if (props.recipes.length === 0) {
    recipeList = <div className="grid-item">No Recipes</div>
  }
  return (
    <div className="container">
      <Navbar/>
      <section className="section">
        <div className="grid-container">{ recipeList }</div>
      </section>
    </div>
  )
}

RecipeList.defaultProps = {
  recipes: [],
}

RecipeList.PropTypes = {
  recipes: PropTypes.arrayOf(recipeType),
}

export default RecipeList
