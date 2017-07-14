import { connect } from 'react-redux'

import { addToCart, removeFromCart } from '../store/actions.js'
import RecipeList from '../RecipeList.jsx'

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

const ConnectedRecipeList = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RecipeList)

export default ConnectedRecipeList
