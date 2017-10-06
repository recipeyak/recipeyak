import { connect } from 'react-redux'

import { addingToCart, removingFromCart } from '../store/actions.js'
import SearchBox from '../components/SearchBox.jsx'

const mapStateToProps = state => {
  return {
    cart: state.cart,
    recipes: state.recipes,
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
  }
}

const ConnectedSearchBox = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchBox)

export default ConnectedSearchBox
