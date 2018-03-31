import { connect } from 'react-redux'

import {
  fetchRecipe,
  addingToCart,
  removingFromCart,
  deletingRecipe,
  updatingCart
} from '../store/actions'

import Recipe from '../components/Recipe'

const mapStateToProps = (state, props) => {
  const id = props.match.params.id
  const recipe = state.recipes[id] ? state.recipes[id] : {}
  return {
    ...recipe,
    loading: state.loading.cart || recipe.loading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchRecipe: id => dispatch(fetchRecipe(id)),
    addToCart: id => dispatch(addingToCart(id)),
    removeFromCart: id => dispatch(removingFromCart(id)),
    deleteRecipe: id => dispatch(deletingRecipe(id)),
    updateCart: (id, count) => dispatch(updatingCart(id, count))
  }
}

const ConnectedIngredients = connect(
  mapStateToProps,
  mapDispatchToProps
)(Recipe)

export default ConnectedIngredients
