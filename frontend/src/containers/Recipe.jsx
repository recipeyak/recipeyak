import { connect } from 'react-redux'

import {
  addIngredientToRecipe,
  addStepToRecipe,
} from '../store/actions.js'

import Recipe from '../Recipe.jsx'

const mapStateToProps = (state, props) => {
  const id = props.match.params.id
  const recipe = state.recipes[id]
  console.log(recipe)
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
  }
}

const ConnectedIngredients = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Recipe)

export default ConnectedIngredients
