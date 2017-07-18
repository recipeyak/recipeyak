import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { recipe as recipeType } from './propTypes.js'
import Navbar from './Nav.jsx'
import Recipe from './RecipeItem.jsx'
import IngredientsList from './IngredientsList.jsx'

import './cart.scss'

const Cart = ({ addToCart, removeFromCart, cart = {}, recipes }) => {
  const cartHasItems = Object.keys(cart).reduce((acc, key) => cart[key] > 0 ? true : acc, false)
  const recipeItems = (Object.keys(cart).length > 0 && cartHasItems)
    ? Object.keys(cart)
      .map(recipeID => {
        // check how many times the recipe is in the cart
        const recipe = recipes[recipeID]
        recipe.inCart = cart[recipeID]
        return recipe
      })
      .map(recipe => (
        cart[recipe.id] > 0
        ? <Recipe
          {...recipe}
          key={ recipe.name + recipe.id }
          removeFromCart={ () => removeFromCart(recipe.id)}
          addToCart={ () => addToCart(recipe.id)}
        />
        : ''
      ))
    : <p className="no-recipes">No recipes in cart.</p>

  const cartRecipes = Object.keys(cart).map(recipeID => recipes[recipeID])

  return (
    <div className="container">
      <Navbar/>
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h2 className="title">Recipes</h2>
              { recipeItems }
            </div>
            <div className="column">
              <h2 className="title">
                <Link to="/ingredients">Shopping List</Link>
              </h2>
              { cartHasItems ? <IngredientsList recipes={ cartRecipes } /> : <p className="no-recipes">No ingredients to list.</p> }
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

Cart.PropTypes = {
  addToCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
  cart: PropTypes.object.isRequired,
  recipes: PropTypes.objectOf(recipeType).isRequired,
}

export default Cart
