import { connect, Dispatch } from 'react-redux'

import { StateTree } from '../store/store'

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
} from '../store/actions'

import {
  Ingredient,
  Recipe,
} from '../store/reducers/recipes'

import {
  RouterProps
} from './Team'

import RecipeEdit from '../components/RecipeEdit'

const mapStateToProps = (state: StateTree, props: RouterProps) => {
  const id = parseInt(props.match.params.id, 10)
  const recipe = state.recipes[id]
    ? state.recipes[id]
    : { loading: true }
  return recipe
}

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
  return {
    fetchRecipe: (id: number) => {
      dispatch(fetchRecipe(id))
    },
    addIngredient: (recipeID: number, ingredient: Ingredient) =>
      dispatch(addingRecipeIngredient(recipeID, ingredient)),
    addStep: (id: number, step: string) =>
      dispatch(addingRecipeStep(id, step)),
    updateName: (id: number, name: string) => {
      dispatch(sendUpdatedRecipeName(id, name))
    },
    updateStep: (recipeID: number, stepID: number, text: string) => {
      dispatch(updatingStep(recipeID, stepID, text))
    },
    updateIngredient: (recipeID: number, ingredientID: number, content: Ingredient) => {
      dispatch(updatingIngredient(recipeID, ingredientID, content))
    },
    deleteIngredient: (recipeID: number, ingredientID: number) => {
      dispatch(deletingIngredient(recipeID, ingredientID))
    },
    deleteStep: (id: number, index: number) => {
      dispatch(deletingStep(id, index))
    },
    updateSource: (id: number, source: string) => {
      dispatch(setRecipeSource(id, source))
    },
    updateAuthor: (id: number, author: string) => {
      dispatch(setRecipeAuthor(id, author))
    },
    updateTime: (id: number, time: string) => {
      dispatch(setRecipeTime(id, time))
    },
    deleteRecipe: (id: number) => dispatch(deletingRecipe(id)),
    updateRecipe: (id: number, data: Recipe) => dispatch(updateRecipe(id, data))
  }
}

const ConnectedIngredients = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(RecipeEdit)

export default ConnectedIngredients
