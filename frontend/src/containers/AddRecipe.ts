import { connect } from "react-redux"

import {
  postNewRecipe,
  fetchTeams,
  Dispatch
} from "../store/actions"

import AddRecipe, {
  IIngredientBasic,
  IRecipeBasic
} from "../components/AddRecipe"

import { teamsFrom } from "../store/mapState"
import { RootState } from "../store/store"
import {

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
  clearAddRecipeForm } from "../store/reducers/addrecipe";
import { setErrorAddRecipe } from "../store/reducers/error";

const mapStateToProps = (state: RootState) => ({
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
  loadingTeams: state.teams.loading
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setName: (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(setAddRecipeFormName(e.target.value)),
  setAuthor: (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(setAddRecipeFormAuthor(e.target.value)),
  setSource: (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(setAddRecipeFormSource(e.target.value)),
  setTime: (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(setAddRecipeFormTime(e.target.value)),
  setServings: (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(setAddRecipeFormServings(e.target.value)),
  setTeam: (e: React.ChangeEvent<HTMLSelectElement>) =>
    dispatch(setAddRecipeFormTeam(e.target.value)),

  addIngredient: (x: IIngredientBasic) =>
    dispatch(addAddRecipeFormIngredient(x)),
  removeIngredient: (i: number) => dispatch(removeAddRecipeFormIngredient(i)),
  updateIngredient: (i: number, ingredient: IIngredientBasic) =>
    dispatch(updateAddRecipeFormIngredient(i, ingredient)),

  addStep: (x: { text?: string }) => dispatch(addAddRecipeFormStep(x)),
  removeStep: (i: number) => dispatch(removeAddRecipeFormStep(i)),
  updateStep: (_recipeID: number, i: number, step: unknown) =>
    dispatch(updateAddRecipeFormStep(i, step)),

  addRecipe: (recipe: IRecipeBasic) => dispatch(postNewRecipe(recipe)),
  clearErrors: () => dispatch(setErrorAddRecipe({})),
  clearForm: () => dispatch(clearAddRecipeForm()),

  fetchData: () => dispatch(fetchTeams())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddRecipe)
