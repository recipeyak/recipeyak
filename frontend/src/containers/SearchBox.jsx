import { connect } from 'react-redux'

import { addToCart, removeFromCart } from '../store/actions.js'
import SearchBox from '../SearchBox.jsx'

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

const ConnectedSearchBox = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchBox)

export default ConnectedSearchBox
