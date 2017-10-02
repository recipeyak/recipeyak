import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { recipe as recipeType } from './propTypes.js'
import Base from './Base.jsx'
import Recipe from './RecipeItem.jsx'
import IngredientsList from './IngredientsList.jsx'

import './cart.scss'

class Cart extends React.Component {
  componentWillMount () {
    this.props.fetchData()
  }

  render () {
    const { cart, recipes, removeFromCart, addToCart, loading } = this.props
    if (loading) return <Base><p>Loading...</p></Base>

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
            url={ `/recipes/${recipe.id}/` }
            removeFromCart={ () => removeFromCart(recipe.id)}
            addToCart={ () => addToCart(recipe.id)}
          />
          : ''
        ))
      : <p className="no-recipes">No recipes in cart.</p>

    const cartRecipes = Object.keys(cart).map(recipeID => recipes[recipeID])

    return (
      <Base>
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
              {
                cartHasItems
                  ? <div className="box">
                      <IngredientsList recipes={ cartRecipes } />
                    </div>
                  : <p className="no-recipes">No ingredients to list.</p>
              }
            </div>
          </div>
        </div>
      </Base>
    )
  }
}

Cart.PropTypes = {
  fetchData: PropTypes.func.isRequired,
  addToCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
  cart: PropTypes.object.isRequired,
  recipes: PropTypes.objectOf(recipeType).isRequired,
}

Cart.defaultProps = {
  cart: {},
}

export default Cart
