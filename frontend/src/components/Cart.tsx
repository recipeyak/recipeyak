import * as React from 'react'
import { Helmet } from 'react-helmet'

import Recipe from '../containers/RecipeItem.jsx'
import Loader from './Loader.jsx'
import DeadFish from './DeadFish.jsx'

const selectElementText = (el: HTMLElement) => {
  const sel = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(el)
  sel.removeAllRanges()
  sel.addRange(range)
}


interface ShoppingListItem {
  name: string
  unit: string
}

interface Ingredient {
  id: number
  text: string
}

interface Recipe {
  id: number
  title: string
  author: string
  source: string
  ingredients: Array<Ingredient>
}

interface CartProps {
  fetchData(): void
  loading: boolean
  recipes: Array<Recipe>
  shoppinglist: Array<ShoppingListItem>
  error: boolean
  updateCart(id: number, count: number): void
  removeFromCart(id: number): void
  addToCart(id: number): void
  loadingShoppingList: boolean
  clearCart: Function
  clearingCart: boolean
}

class Cart extends React.Component<CartProps,{}> {
  componentWillMount() {
    this.props.fetchData()
  }

  static defaultProps = {
    shoppinglist: [] as Array<ShoppingListItem>,
    recipes: [] as Array<Recipe>,
    loading: true,
  }

  render () {
    const {
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
    if (emptyCart && !loadingShoppingList) {
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
                key={ recipe.id }
                removeFromCart={ removeFromCart }
                addToCart={ addToCart }
                updateCart={ updateCart }
              />
            )
          }
          <button
            onClick={ () => clearCart() }
            className={ `my-button control ${clearingCart ? 'is-loading' : ''}` }>Clear Cart</button>
        </div>
        <div>
          <div className={`box p-rel min-height-75px ${loadingShoppingList ? 'has-text-grey-light' : ''}`} >
            <button
              onClick={ () => selectElementText(document.querySelector('#shoppinglist')) }
              className="my-button is-small r-5 p-abs">
              Select
            </button>
            <section id="shoppinglist">
            {
              shoppinglist.map((x, i) =>
                // padding serves to prevent the button from appearing in front of text
                <p className={ i === 0 ? 'mr-15' : '' } key={x.unit + x.name}>{x.unit} {x.name}</p>
              )
            }
          </section>
          </div>
        </div>
      </div>
    )
  }
}

export default Cart
