import React from 'react'
import { Helmet } from 'react-helmet'

import Recipe from './RecipeItem.jsx'
import Loader from './Loader.jsx'

class Cart extends React.Component {
  componentWillMount = () => {
    this.props.fetchData()
  }

  static defaultProps = {
    cart: {},
    shoppinglist: [],
    recipes: []
  }

  render () {
    const {
      cart,
      recipes,
      removeFromCart,
      addToCart,
      loading,
      shoppinglist,
      loadingShoppingList,
      clearCart,
      clearingCart
    } = this.props

    if (loading) {
      return (
        <div className="cart-container">
          <Helmet title='Cart' />
          <Loader/>
        </div>
      )
    }

    const emptyCart = shoppinglist.length <= 0 || recipes.length <= 0
    if (emptyCart) {
      return (
        <div>
          <Helmet title='Cart' />
          <p className="fs-8 text-center">No recipes in cart.</p>
        </div>
      )
    }

    return (
      <div className="cart-container">
        <Helmet title='Cart' />
        <div className="d-grid grid-gap-4 grid-auto-rows-min-content">
          {
            recipes.map(recipe =>
              <Recipe
                {...recipe}
                inCart={ cart[recipe.id] > 0 ? cart[recipe.id] : 0 }
                key={ recipe.id }
                removeFromCart={ () => removeFromCart(recipe.id)}
                addToCart={ () => addToCart(recipe.id)}
              />
            )
          }
          <button
            onClick={ clearCart }
            className={ `my-button control ${clearingCart ? 'is-loading' : ''}` }>Clear Cart</button>
        </div>
        <div>
          <div className={loadingShoppingList ? 'box has-text-grey-light' : 'box'} >
            {
              shoppinglist.map(x =>
                <p key={x.name}>{x.unit} {x.name} </p>
              )
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Cart
