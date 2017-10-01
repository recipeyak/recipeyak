import { connect } from 'react-redux'

import { addToCart, removeFromCart, fetchCart } from '../store/actions.js'
import Cart from '../components/Cart.jsx'

const mapStateToProps = state => {
  return {
    cart: state.cart,
    recipes: state.recipes,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: id => {
      dispatch(addToCart(id))
    },
    removeFromCart: id => {
      dispatch(removeFromCart(id))
    },
    fetchCart: () => {
      dispatch(fetchCart())
    },
  }
}

const ConnectedCart = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Cart)

export default ConnectedCart
