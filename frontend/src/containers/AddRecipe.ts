import { connect, Dispatch } from 'react-redux'
import { StateTree } from '../store/store'

import {
  postNewRecipe,
  setErrorAddRecipe,

  setAddRecipeFormName,
  setAddRecipeFormAuthor,
  setAddRecipeFormSource,
  setAddRecipeFormTime,
  setAddRecipeFormServings,
  setAddRecipeFormTeam,

  addAddRecipeFormIngredient,
  removeAddRecipeFormIngredient,
  updateAddRecipeFormIngredient,

  addAddRecipeFormStep,
  removeAddRecipeFormStep,
  updateAddRecipeFormStep,

  clearAddRecipeForm,

  fetchTeams,
} from '../store/actions'

import AddRecipe from '../components/AddRecipe'

import {
  Recipe,
  Step,
  Ingredient,
} from '../store/reducers/recipes'

import {
  teamsFrom
} from '../store/mapState'

const mapStateToProps = (state: StateTree) => ({
  name: state.addrecipe.name,
  author: state.addrecipe.author,
  source: state.addrecipe.source,
  time: state.addrecipe.time,
  team: state.addrecipe.team,
  servings: state.addrecipe.servings,
  ingredients: state.addrecipe.ingredients,
  steps: state.addrecipe.steps,
  loading: state.loading.addRecipe,
  error: state.error.addRecipe,
  // we remove the loading
  teams: teamsFrom(state),
  loadingTeams: state.teams.loading,
})

export interface SubmitEvent {
  target: {
    value: string
  }
}

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => ({
  setName: (e: SubmitEvent) => dispatch(setAddRecipeFormName(e.target.value)),
  setAuthor: (e: SubmitEvent) => dispatch(setAddRecipeFormAuthor(e.target.value)),
  setSource: (e: SubmitEvent) => dispatch(setAddRecipeFormSource(e.target.value)),
  setTime: (e: SubmitEvent) => dispatch(setAddRecipeFormTime(e.target.value)),
  setServings: (e: SubmitEvent) => dispatch(setAddRecipeFormServings(e.target.value)),
  setTeam: (e: SubmitEvent) => dispatch(setAddRecipeFormTeam(e.target.value)),

  addIngredient: (x: Ingredient) => dispatch(addAddRecipeFormIngredient(x)),
  removeIngredient: (i: number) => dispatch(removeAddRecipeFormIngredient(i)),
  updateIngredient: (i: number, ingredient: Ingredient) => dispatch(updateAddRecipeFormIngredient(i, ingredient)),

  addStep: (x: { text: string }) => dispatch(addAddRecipeFormStep(x)),
  removeStep: (i: number) => dispatch(removeAddRecipeFormStep(i)),
  updateStep: (i: number, step: Step) => dispatch(updateAddRecipeFormStep(i, step)),

  addRecipe: (recipe: Recipe) => dispatch(postNewRecipe(recipe)),
  clearErrors: () => dispatch(setErrorAddRecipe({})),
  clearForm: () => dispatch(clearAddRecipeForm()),

  fetchData: () => dispatch(fetchTeams()),
})

const ConnectedAddRecipe = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(AddRecipe)

export default ConnectedAddRecipe
