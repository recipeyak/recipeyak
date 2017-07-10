import { connect } from 'react-redux'

import { addToCart, removeFromCart } from '../store/actions.js'
import Cart from '../Cart.jsx'

const mapStateToProps = (state, ownProps) => {
  return {
    cart: state.cart,
    recipes: state.recipes,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addToCart: () => {
      dispatch(addToCart(ownProps.recipeID))
    },
    removeFromCart: () => {
      dispatch(removeFromCart(ownProps.recipeID))
    },
  }
}

const ConnectedCart = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Cart)

export default ConnectedCart
