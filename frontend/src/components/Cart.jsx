import React from 'react'

import Recipe from './RecipeItem.jsx'
import './cart.scss'

class Cart extends React.Component {
  componentWillMount () {
    this.props.fetchData()
  }

  render () {
    const {
      cart,
      recipes,
      removeFromCart,
      addToCart,
      loading,
      shoppinglist,
      loadingShoppingList
    } = this.props

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
                shoppinglist.length > 0
                  ? <div className={loadingShoppingList ? 'box has-text-grey-light' : 'box'} >
                    {
                      shoppinglist.map(x =>
                        <p key={x.name}>{x.unit} {x.name} </p>
                      )
                    }
                    </div>
                  : <p className="no-recipes">No shopping list to list.</p>
              }
            </div>
          </div>
        </div>
    )
  }
}

Cart.defaultProps = {
  cart: {},
  shoppinglist: []
}

export default Cart
