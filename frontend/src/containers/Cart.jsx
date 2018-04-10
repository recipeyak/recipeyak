import { connect } from 'react-redux'

import {
  byNameAlphabetical,
  ingredientByNameAlphabetical
} from '../sorters'

import {
  addingToCart,
  removingFromCart,
  fetchRecipeList,
  fetchShoppingList,
  clearCart,
  updatingCart,
  reportBadMerge,
} from '../store/actions.js'

import Cart from '../components/Cart.jsx'

const mapStateToProps = state => {
  return {
    recipes: Object.values(state.recipes)
             .filter(x => x.cart_count > 0)
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
    updateCart: async (id, count) => {
      await dispatch(updatingCart(id, count))
      await dispatch(fetchShoppingList())
    },
    fetchData: () => {
      dispatch(fetchRecipeList())
      dispatch(fetchShoppingList())
    },
    clearCart: () => dispatch(clearCart()),
    reportBadMerge: () => dispatch(reportBadMerge())
  }
}

const ConnectedCart = connect(
  mapStateToProps,
  mapDispatchToProps
)(Cart)

export default ConnectedCart
