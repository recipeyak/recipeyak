import React from 'react'
import PropTypes from 'prop-types'

import { recipe as recipeType } from './propTypes.js'
import Navbar from './Nav.jsx'
import Recipe from './RecipeItem.jsx'

import 'bulma/css/bulma.css'

import './recipe-list.scss'

const RecipeList = ({ recipes = {}, cart = {}, removeFromCart, addToCart }) => {
  recipes = Object.keys(recipes).map(recipeId =>
    <div className="grid-item" key={ recipeId }>
      <Recipe
        {...recipes[recipeId]}
        inCart={ cart[recipeId] > 0 ? cart[recipeId] : 0 }
        key={ recipeId }
        removeFromCart={ () => removeFromCart(recipeId)}
        addToCart={ () => addToCart(recipeId)}
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
  recipes: PropTypes.arrayOf(recipeType),
  removeFromCart: PropTypes.func.isRequired,
  addToCart: PropTypes.func.isRequired,
}

export default RecipeList
