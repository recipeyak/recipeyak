import { connect } from "react-redux"

import {
  postNewRecipeAsync,
  Dispatch,
  fetchingTeamsAsync
} from "@/store/thunks"

import AddRecipe from "@/components/AddRecipe"

import { teamsFrom } from "@/store/mapState"
import { IState } from "@/store/store"
import {
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
  clearAddRecipeForm
} from "@/store/reducers/addrecipe"
import { ITeam } from "@/store/reducers/teams"
import {
  IIngredientBasic,
  IStepBasic,
  resetAddRecipeErrors
} from "@/store/reducers/recipes"
import { updateTeamID } from "@/store/reducers/user"

const mapStateToProps = (state: IState) => ({
  name: state.addrecipe.name,
  author: state.addrecipe.author,
  source: state.addrecipe.source,
  time: state.addrecipe.time,
  servings: state.addrecipe.servings,
  ingredients: state.addrecipe.ingredients,
  steps: state.addrecipe.steps,
  loading: state.recipes.creatingRecipe,
  error: state.recipes.errorCreatingRecipe,
  // we remove the loading
  teams: teamsFrom(state),
  loadingTeams:
    state.teams.status === "loading" || state.teams.status === "initial",
  teamID: state.user.teamID
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
  setTeamID: (id: ITeam["id"] | null) => dispatch(updateTeamID(id)),

  addIngredient: (x: IIngredientBasic) =>
    dispatch(addAddRecipeFormIngredient(x)),
  removeIngredient: (i: number) => dispatch(removeAddRecipeFormIngredient(i)),
  updateIngredient: (i: number, ingredient: IIngredientBasic) =>
    dispatch(updateAddRecipeFormIngredient({ index: i, ingredient })),

  addStep: (x: IStepBasic) => dispatch(addAddRecipeFormStep(x)),
  removeStep: (i: number) => dispatch(removeAddRecipeFormStep(i)),
  updateStep: (_recipeID: number, i: number, step: IStepBasic) =>
    dispatch(updateAddRecipeFormStep({ index: i, step })),

  addRecipe: postNewRecipeAsync(dispatch),
  clearErrors: () => dispatch(resetAddRecipeErrors()),
  clearForm: () => dispatch(clearAddRecipeForm()),

  fetchData: fetchingTeamsAsync(dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(AddRecipe)
