import { connect, Dispatch } from 'react-redux'

import {
  fetchRecipe,
  addingToCart,
  removingFromCart,
  deletingRecipe,
  updatingCart
} from '../store/actions'

import {
  StateTree
} from '../store/store'

import Recipe from '../components/Recipe'

import { RouterProps } from './Team'

const mapStateToProps = (state: StateTree, props: RouterProps) => {
  const id = parseInt(props.match.params.id, 10)
  const recipe = state.recipes[id]
    ? state.recipes[id]
    : { loading: false }
  return {
    ...recipe,
    loading: state.loading.cart || recipe.loading
  }
}

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
  return {
    fetchRecipe: (id: number) => dispatch(fetchRecipe(id)),
    addToCart: (id: number) => dispatch(addingToCart(id)),
    removeFromCart: (id: number) => dispatch(removingFromCart(id)),
    deleteRecipe: (id: number) => dispatch(deletingRecipe(id)),
    updateCart: (id: number, count: number) => dispatch(updatingCart(id, count))
  }
}

const ConnectedIngredients = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(Recipe)

export default ConnectedIngredients
