import { connect } from 'react-redux'

import { byNameAlphabetical } from '../sorters'

import {
  fetchRecipeList
} from '../store/actions.js'

import RecipeList from '../components/RecipeList.jsx'

const mapStateToProps = state => {
  return {
    recipes: Object.values(state.recipes)
             .sort(byNameAlphabetical),
    loading: state.loading.recipes || state.loading.cart,
    error: state.error.recipes
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchData: () => dispatch(fetchRecipeList())
  }
}

const ConnectedRecipeList = connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipeList)

export default ConnectedRecipeList
