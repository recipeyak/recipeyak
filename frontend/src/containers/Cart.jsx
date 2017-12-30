import { connect } from 'react-redux'

import {
  byNameAlphabetical,
  ingredientByNameAlphabetical
} from '../sorters'

import {
  addingToCart,
  removingFromCart,
  fetchCart,
  fetchRecipeList,
  fetchShoppingList,
  clearCart
} from '../store/actions.js'

import Cart from '../components/Cart.jsx'

const mapStateToProps = state => {
  return {
    cart: state.cart,
    recipes: Object.values(state.recipes)
             .filter(recipe => state.cart[recipe.id] > 0)
             .sort(byNameAlphabetical),
    loading: state.loading.recipes || state.loading.cart,
    shoppinglist: state.shoppinglist.shoppinglist
                  .sort(ingredientByNameAlphabetical),
    loadingShoppingList: state.shoppinglist.loading,
    clearingCart: state.cart.clearing,
    error: state.shoppinglist.error
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: async id => {
      await dispatch(addingToCart(id))
      await dispatch(fetchShoppingList())
    },
    removeFromCart: async id => {
      await dispatch(removingFromCart(id))
      await dispatch(fetchShoppingList())
    },
    fetchData: () => {
      dispatch(fetchRecipeList())
      dispatch(fetchCart())
      dispatch(fetchShoppingList())
    },
    clearCart: () => dispatch(clearCart())
  }
}

const ConnectedCart = connect(
  mapStateToProps,
  mapDispatchToProps
)(Cart)

export default ConnectedCart
