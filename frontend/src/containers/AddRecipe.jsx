import { connect } from 'react-redux'

import {
  postNewRecipe,
  setErrorAddRecipe,

  setAddRecipeFormName,
  setAddRecipeFormAuthor,
  setAddRecipeFormSource,
  setAddRecipeFormTime,
  setAddRecipeFormServings,

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

const notBool = x => typeof x !== 'boolean'

const mapStateToProps = state => ({
  name: state.addrecipe.name,
  author: state.addrecipe.author,
  source: state.addrecipe.source,
  time: state.addrecipe.time,
  servings: state.addrecipe.servings,
  ingredients: state.addrecipe.ingredients,
  steps: state.addrecipe.steps,
  loading: state.loading.addRecipe,
  error: state.error.addRecipe,
  // we remove the loading
  teams: Object.values(state.teams).filter(notBool),
  loadingTeams: state.teams.loading,
})

const mapDispatchToProps = dispatch => ({
  setName: e => dispatch(setAddRecipeFormName(e.target.value)),
  setAuthor: e => dispatch(setAddRecipeFormAuthor(e.target.value)),
  setSource: e => dispatch(setAddRecipeFormSource(e.target.value)),
  setTime: e => dispatch(setAddRecipeFormTime(e.target.value)),
  setServings: e => dispatch(setAddRecipeFormServings(e.target.value)),

  addIngredient: x => dispatch(addAddRecipeFormIngredient(x)),
  removeIngredient: i => dispatch(removeAddRecipeFormIngredient(i)),
  updateIngredient: (i, ingredient) => dispatch(updateAddRecipeFormIngredient(i, ingredient)),

  addStep: x => dispatch(addAddRecipeFormStep(x)),
  removeStep: i => dispatch(removeAddRecipeFormStep(i)),
  updateStep: (i, step) => dispatch(updateAddRecipeFormStep(i, step)),

  addRecipe: recipe => dispatch(postNewRecipe(recipe)),
  clearErrors: () => dispatch(setErrorAddRecipe({})),
  clearForm: () => dispatch(clearAddRecipeForm()),

  fetchData: () => dispatch(fetchTeams()),
})

const ConnectedAddRecipe = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddRecipe)

export default ConnectedAddRecipe
