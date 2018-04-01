import { connect, Dispatch } from 'react-redux'

import { StateTree } from '../store/store'

import { byNameAlphabetical } from '../sorters'

import {
  fetchRecipeList
} from '../store/actions'

import RecipeList from '../components/RecipeList'

const mapStateToProps = (state: StateTree) => {
  return {
    recipes: Object.values(state.recipes)
             .sort(byNameAlphabetical),
    loading: state.loading.recipes || state.loading.cart,
    error: state.error.recipes
  }
}

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
  return {
    fetchData: () => dispatch(fetchRecipeList())
  }
}

const ConnectedRecipeList = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(RecipeList)

export default ConnectedRecipeList
