import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import recipeType from './propTypes.js'

import Navbar from './Nav.jsx'
import Recipe from './RecipeItem.jsx'
import './cart.scss'

const Cart = ({ store, cart = [] }) => {
  const recipeItems = cart.length > 0
    ? cart.map(recipe =>
        <Recipe
          {...recipe}
          key={ recipe.id }
          removeFromCart={ () => store.removeFromCart(recipe.id)}
          addToCart={ () => store.addToCart(recipe.id)}
        />)
    : <p className="no-recipes">No recipes in cart.</p>

  const ingredients = cart.map(recipe => [recipe.ingredients, recipe.id])

  const ingredientList = ingredients.length > 0
    ? <div className="card">
        <ul className="ingredients-list card-content">
          { ingredients.map((ingredient, id) => <li key={id}>{ingredient}</li>) }
        </ul>
      </div>
    : <p className="no-recipes">No ingredients.</p>

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
                { ingredientList }
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

Cart.PropTypes = {
  cart: PropTypes.arrayOf(recipeType),
}

export default Cart
