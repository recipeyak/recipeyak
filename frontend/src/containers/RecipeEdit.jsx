import { connect } from 'react-redux'

import {
  addingRecipeIngredient,
  addingRecipeStep,
  sendUpdatedRecipeName,
  deletingIngredient,
  deletingStep,
  setRecipeSource,
  setRecipeAuthor,
  setRecipeTime,
  fetchRecipe,
  updatingIngredient,
  updatingStep,
  deletingRecipe,
  updateRecipe
} from '../store/actions.js'

import RecipeEdit from '../components/RecipeEdit.jsx'

const mapStateToProps = (state, props) => {
  const id = props.match.params.id
  const recipe = state.recipes[id]
    ? state.recipes[id]
    : { loading: true }
  return recipe
}

const mapDispatchToProps = dispatch => {
  return {
    fetchRecipe: id => {
      dispatch(fetchRecipe(id))
    },
    addIngredient: (recipeID, ingredient) =>
      dispatch(addingRecipeIngredient(recipeID, ingredient)),
    addStep: (id, step) =>
      dispatch(addingRecipeStep(id, step)),
    updateName: (id, name) => {
      dispatch(sendUpdatedRecipeName(id, name))
    },
    updateStep: (...args) =>
      dispatch(updatingStep(...args)),
    updateIngredient: (recipeID, ingredientID, content) =>
      dispatch(updatingIngredient(recipeID, ingredientID, content)),
    deleteIngredient: (recipeID, ingredientID) =>
      dispatch(deletingIngredient(recipeID, ingredientID)),
    deleteStep: (id, index) =>
      dispatch(deletingStep(id, index)),
    updateSource: (id, source) => {
      dispatch(setRecipeSource(id, source))
    },
    updateAuthor: (id, author) => {
      dispatch(setRecipeAuthor(id, author))
    },
    updateTime: (id, time) => {
      dispatch(setRecipeTime(id, time))
    },
    deleteRecipe: id => dispatch(deletingRecipe(id)),
    updateRecipe: (id, data) => dispatch(updateRecipe(id, data))
  }
}

const ConnectedIngredients = connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipeEdit)

export default ConnectedIngredients
