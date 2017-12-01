import { connect } from 'react-redux'

import {
  fetchRecipe,
  fetchCart,
  addingToCart,
  removingFromCart,
  deletingRecipe
} from '../store/actions.js'

import Recipe from '../components/Recipe.jsx'

const mapStateToProps = (state, props) => {
  const id = props.match.params.id
  const recipe = state.recipes[id] ? state.recipes[id] : {}
  return {
    ...recipe,
    inCart: state.cart[recipe.id] > 0 ? state.cart[recipe.id] : 0,
    loading: state.loading.cart || recipe.loading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchRecipe: id => {
      dispatch(fetchRecipe(id))
      dispatch(fetchCart(id))
    },
    addToCart: id => dispatch(addingToCart(id)),
    removeFromCart: id => dispatch(removingFromCart(id)),
    deleteRecipe: id => dispatch(deletingRecipe(id))
  }
}

const ConnectedIngredients = connect(
  mapStateToProps,
  mapDispatchToProps
)(Recipe)

export default ConnectedIngredients
