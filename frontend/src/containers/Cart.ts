import { connect, Dispatch } from 'react-redux'

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
  updatingCart
} from '../store/actions'

import Cart from '../components/Cart'

import { Recipe } from '../store/reducers/recipes'

import { StateTree } from '../store/store'

const mapStateToProps = (state: StateTree) => {
  return {
    // TODO: we shouldn't be getting recipes this way, just map across ids
    recipes: Object.values(state.recipes)
             .filter((x: Recipe) => x.cart_count > 0)
             .sort(byNameAlphabetical),
    loading: state.loading.recipes || state.loading.cart,
    shoppinglist: state.shoppinglist.shoppinglist
                  .sort(ingredientByNameAlphabetical),
    loadingShoppingList: state.shoppinglist.loading,
    clearingCart: state.cart.clearing,
    error: state.shoppinglist.error
  }
}

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
  return {
    addToCart: async (id: number) => {
      await dispatch(addingToCart(id))
      await dispatch(fetchShoppingList())
    },
    removeFromCart: async (id: number) => {
      await dispatch(removingFromCart(id))
      await dispatch(fetchShoppingList())
    },
    updateCart: async (id: number, count: number) => {
      await dispatch(updatingCart(id, count))
      await dispatch(fetchShoppingList())
    },
    fetchData: () => {
      dispatch(fetchRecipeList())
      dispatch(fetchShoppingList())
    },
    clearCart: () => dispatch(clearCart())
  }
}

const ConnectedCart = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(Cart)

export default ConnectedCart
