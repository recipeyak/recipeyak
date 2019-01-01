import { connect } from "react-redux"

import {
  fetchTeam,
  fetchTeamMembers,
  fetchTeamRecipes,
  deletingTeam,
  updatingTeam,
  Dispatch
} from "@/store/actions"
import Team from "@/components/Team"
import { RootState } from "@/store/store"
import { RouteComponentProps } from "react-router"
import { ITeam } from "@/store/reducers/teams"
import { isSuccess } from "@/store/remotedata"

type RouteProps = RouteComponentProps<{ id: string }>

const mapStateToProps = (state: RootState, props: RouteProps) => {
  const id = parseInt(props.match.params.id, 10)
  const team: ITeam | undefined = state.teams[id]

  // TODO(sbdchd): clean up this mess

  const isSettings = props.match.url.endsWith("settings")

  const recipes = team == null || team.recipes == null ? [] : team.recipes

  const members = team == null || team.members == null ? [] : team.members

  const teamMembers = Object.values(members)

  return {
    id,
    members: teamMembers,
    isSettings,
    error404: team ? !!team.error404 : false,
    loadingTeam: team ? !!team.loadingTeam : false,
    name: team ? team.name : "",
    loadingMembers: team ? !!team.loadingMembers : false,
    loadingRecipes: team ? !!team.loadingRecipes : false,
    // TODO(sbdchd): this should be using a getter
    recipes: recipes
      .map(recipeID => state.recipes.byId[recipeID])
      .filter(isSuccess)
      .map(r => r.data)
  }
}
const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    fetchData: (id: ITeam["id"]) =>
      Promise.all([
        fetchTeam(dispatch)(id),
        fetchTeamMembers(dispatch)(id),
        fetchTeamRecipes(dispatch)(id)
      ]),
    deleteTeam: deletingTeam(dispatch),
    updatingTeam: updatingTeam(dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Team)
