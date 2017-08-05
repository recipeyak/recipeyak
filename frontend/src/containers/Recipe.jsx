import { connect } from 'react-redux'

import {
  addIngredientToRecipe,
  addStepToRecipe,
  updateRecipeName,
  deleteIngredient,
  deleteStep,
  updateRecipeSource,
  updateRecipeAuthor,
  updateRecipeTime,
} from '../store/actions.js'

import Recipe from '../Recipe.jsx'

const mapStateToProps = (state, props) => {
  const id = props.match.params.id
  const recipe = state.recipes[id]
  return {
    id: recipe.id,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    name: recipe.name,
    author: recipe.author,
    source: recipe.source,
    time: recipe.time,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addIngredient: (id, ingredient) => {
      dispatch(addIngredientToRecipe(id, ingredient))
    },
    addStep: (id, step) => {
      dispatch(addStepToRecipe(id, step))
    },
    updateName: (id, name) => {
      dispatch(updateRecipeName(id, name))
    },
    deleteIngredient: (id, index) => {
      dispatch(deleteIngredient(id, index))
    },
    deleteStep: (id, index) => {
      dispatch(deleteStep(id, index))
    },
    updateSource: (id, source) => {
      dispatch(updateRecipeSource(id, source))
    },
    updateAuthor: (id, author) => {
      dispatch(updateRecipeAuthor(id, author))
    },
    updateTime: (id, time) => {
      dispatch(updateRecipeTime(id, time))
    },
  }
}

const ConnectedIngredients = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Recipe)

export default ConnectedIngredients
