import { connect } from 'react-redux'

import { addToCart, removeFromCart, fetchRecipeList } from '../store/actions.js'
import RecipeList from '../components/RecipeList.jsx'

const mapStateToProps = state => {
  return {
    cart: state.cart,
    recipes: state.recipes,
    loading: state.loading.recipes,
    error: state.error.recipes,
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
    fetchRecipeList: () => {
      dispatch(fetchRecipeList())
    },
  }
}

const ConnectedRecipeList = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RecipeList)

export default ConnectedRecipeList
