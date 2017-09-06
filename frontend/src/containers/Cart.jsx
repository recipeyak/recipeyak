import { connect } from 'react-redux'

import { addToCart, removeFromCart } from '../store/actions.js'
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
  }
}

const ConnectedCart = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Cart)

export default ConnectedCart
