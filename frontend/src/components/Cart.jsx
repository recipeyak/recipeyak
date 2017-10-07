import React from 'react'
import PropTypes from 'prop-types'

import { recipe as recipeType } from './propTypes.js'
import Recipe from './RecipeItem.jsx'
import './cart.scss'

class Cart extends React.Component {
  componentWillMount () {
    this.props.fetchData()
  }

  render () {
    const { cart, recipes, removeFromCart, addToCart, loading, ingredients } = this.props

    if (loading) return <p>Loading...</p>

    const urlFromID = id => `/recipes/${id}/`

    const cartHasItems = Object.values(cart).find(x => x > 0) != null
    const recipeItems = cartHasItems
      ? Object.values(recipes)
        .filter(recipe => cart[recipe.id] > 0)
        .map(recipe => (
          <Recipe
            {...recipe}
            inCart={ cart[recipe.id] > 0 ? cart[recipe.id] : 0 }
            key={ recipe.id }
            url={ urlFromID(recipe.id) }
            removeFromCart={ () => removeFromCart(recipe.id)}
            addToCart={ () => addToCart(recipe.id)}
          />
        ))
      : <p className="no-recipes">No recipes in cart.</p>

    return (
        <div className="container">
          <div className="columns">
            <div className="column">
              <h2 className="title">Recipes</h2>
              { recipeItems }
            </div>
            <div className="column">
              <h2 className="title">Shopping List</h2>
              {
                ingredients.length > 0
                  ? <div className="box">
                    {
                      ingredients.map(x =>
                        <li key={ x.text }>
                          <strong>{ x.count }</strong>{ x.text }
                        </li>
                      )
                    }
                    </div>
                  : <p className="no-recipes">No ingredients to list.</p>
              }
            </div>
          </div>
        </div>
    )
  }
}

Cart.PropTypes = {
  fetchData: PropTypes.func.isRequired,
  addToCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
  cart: PropTypes.object.isRequired,
  recipes: PropTypes.objectOf(recipeType).isRequired,
  ingredients: PropTypes.array.isRequired,
}

Cart.defaultProps = {
  cart: {},
  ingredients: [],
}

export default Cart
