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
  updatingStep
} from '../store/actions.js'

import Recipe from '../components/Recipe.jsx'

const mapStateToProps = (state, props) => {
  const id = props.match.params.id
  const recipe = state.recipes[id] ? state.recipes[id] : {}
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
    updateStep: (recipeID, stepID, text) => {
      dispatch(updatingStep(recipeID, stepID, text))
    },
    updateIngredient: (recipeID, ingredientID, text) => {
      dispatch(updatingIngredient(recipeID, ingredientID, text))
    },
    deleteIngredient: (recipeID, ingredientID) => {
      dispatch(deletingIngredient(recipeID, ingredientID))
    },
    deleteStep: (id, index) => {
      dispatch(deletingStep(id, index))
    },
    updateSource: (id, source) => {
      dispatch(setRecipeSource(id, source))
    },
    updateAuthor: (id, author) => {
      dispatch(setRecipeAuthor(id, author))
    },
    updateTime: (id, time) => {
      dispatch(setRecipeTime(id, time))
    }
  }
}

const ConnectedIngredients = connect(
  mapStateToProps,
  mapDispatchToProps
)(Recipe)

export default ConnectedIngredients
