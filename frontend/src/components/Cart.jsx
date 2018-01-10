import React from 'react'
import { Helmet } from 'react-helmet'

import Recipe from '../containers/RecipeItem.jsx'
import Loader from './Loader.jsx'
import DeadFish from './DeadFish.jsx'

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
      clearingCart,
      error,
      updateCart
    } = this.props

    if (error) {
      return (
        <div className="cart-container">
          <Helmet title='Cart' />
          <p>Error fetching data</p>
        </div>
      )
    }

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
        <div className="d-flex flex-direction-column align-items-center">
          <Helmet title='Cart' />
          <DeadFish/>
          <p className="fs-7 text-center fw-500 font-family-title light-text-color">No recipes in cart</p>
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
                removeFromCart={ removeFromCart }
                addToCart={ addToCart }
                updateCart={ updateCart }
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
                <p key={x.unit + x.name}>{x.unit} {x.name} </p>
              )
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Cart
