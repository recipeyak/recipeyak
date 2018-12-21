import { connect } from "react-redux"

import {
  fetchTeam,
  fetchTeamMembers,
  fetchTeamRecipes,
  deletingTeam,
  updatingTeam
} from "../store/actions"

import Team from "../components/Team"

const notUndefined = x => x != null

const mapStateToProps = (state, props) => {
  const id = parseInt(props.match.params.id, 10)
  const team = state.teams[id] ? state.teams[id] : {}

  const isSettings = props.match.url.endsWith("settings")

  const recipes = team.recipes || []

  return {
    ...team,
    id,
    isSettings,
    recipes: recipes.map(id => state.recipes[id]).filter(notUndefined)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchData: id =>
      Promise.all([
        dispatch(fetchTeam(id)),
        dispatch(fetchTeamMembers(id)),
        dispatch(fetchTeamRecipes(id))
      ]),
    deleteTeam: id => dispatch(deletingTeam(id)),
    updatingTeam: (...args) => dispatch(updatingTeam(...args))
  }
}

const ConnectedTeam = connect(
  mapStateToProps,
  mapDispatchToProps
)(Team)

export default ConnectedTeam
