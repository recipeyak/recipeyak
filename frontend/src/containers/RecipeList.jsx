import { connect } from 'react-redux'

import {
  addingToCart,
  removingFromCart,
  fetchRecipeList,
  fetchCart
} from '../store/actions.js'

import RecipeList from '../components/RecipeList.jsx'

const mapStateToProps = state => {
  return {
    cart: state.cart,
    recipes: state.recipes,
    loading: state.loading.recipes || state.loading.cart,
    error: state.error.recipes
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
    }
  }
}

const ConnectedRecipeList = connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipeList)

export default ConnectedRecipeList
