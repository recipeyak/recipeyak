import { connect } from 'react-redux'

import {
  fetchRecipe,
  deletingRecipe,
} from '../store/actions'

import Recipe from '../components/Recipe'

const mapStateToProps = (state, props) => {
  const id = props.match.params.id
  return state.recipes[id] ? state.recipes[id] : {}
}

const mapDispatchToProps = dispatch => {
  return {
    fetchRecipe: id => dispatch(fetchRecipe(id)),
    deleteRecipe: id => dispatch(deletingRecipe(id)),
  }
}

const ConnectedIngredients = connect(
  mapStateToProps,
  mapDispatchToProps
)(Recipe)

export default ConnectedIngredients
