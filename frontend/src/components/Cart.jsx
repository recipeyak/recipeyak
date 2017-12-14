import React from 'react'

import Recipe from './RecipeItem.jsx'
import Loader from './Loader.jsx'

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

    if (loading) {
      return (
        <div className="cart-container">
          <Loader/>
        </div>
      )
    }

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
      <div className="cart-container">
        <div className="d-grid grid-gap-4">
          { recipeItems }
        </div>
        <div>
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
    )
  }
}

Cart.defaultProps = {
  cart: {},
  shoppinglist: []
}

export default Cart
