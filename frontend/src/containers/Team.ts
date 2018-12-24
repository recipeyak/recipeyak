import { connect } from "react-redux"

import {
  fetchTeam,
  fetchTeamMembers,
  fetchTeamRecipes,
  deletingTeam,
  updatingTeam,
  Dispatch
} from "../store/actions"

import Team from "../components/Team"
import { RootState } from "../store/store"
import { RouteComponentProps } from "react-router"
import { IRecipe, IRecipesState } from "../store/reducers/recipes"
import { ITeam } from "../store/reducers/teams"

const notUndefined = (x?: null | IRecipe) => x != null

type RouteProps = RouteComponentProps<{ id: string }>

const mapStateToProps = (state: RootState, props: RouteProps) => {
  const id = parseInt(props.match.params.id, 10)
  const team = state.teams[id] ? state.teams[id] : {}

  const isSettings = props.match.url.endsWith("settings")

  const recipes = (team.recipes || []) as number[]

  return {
    ...team,
    id,
    isSettings,
    recipes: recipes
      .map(recipeID => (state.recipes as IRecipesState)[recipeID])
      .filter(notUndefined)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    fetchData: (id: ITeam["id"]) =>
      Promise.all([
        dispatch(fetchTeam(id)),
        dispatch(fetchTeamMembers(id)),
        dispatch(fetchTeamRecipes(id))
      ]),
    deleteTeam: (id: ITeam["id"]) => dispatch(deletingTeam(id)),
    updatingTeam: (teamId: ITeam["id"], teamKVs: unknown) =>
      dispatch(updatingTeam(teamId, teamKVs))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Team)
