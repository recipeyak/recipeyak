import { connect } from 'react-redux'

import {
  addingToCart,
  removingFromCart,
  fetchCart,
  fetchRecipeList,
} from '../store/actions.js'

import Cart from '../components/Cart.jsx'

const mapStateToProps = state => {
  return {
    cart: state.cart,
    recipes: state.recipes,
    loading: state.loading.recipes || state.loading.cart,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: id => {
      dispatch(addingToCart(id))
    },
    removeFromCart: id => {
      dispatch(removingFromCart(id))
    },
    fetchData: () => {
      dispatch(fetchRecipeList())
      dispatch(fetchCart())
    },
  }
}

const ConnectedCart = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Cart)

export default ConnectedCart
