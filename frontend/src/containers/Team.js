import { connect } from 'react-redux'

import {
  fetchTeam,
  fetchTeamMembers,
  fetchTeamRecipes,
} from '../store/actions'

import Team from '../components/Team'

const notUndefined = x => x != null

const mapStateToProps = (state, props) => {
  const id = parseInt(props.match.params.id, 10)
  const team = state.teams[id]
    ? state.teams[id]
    : {}

  const recipes = team.recipes || []

  return {
    ...team,
    id,
    recipes: recipes.map(id => state.recipes[id]).filter(notUndefined)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchData: (id) => Promise.all([
      dispatch(fetchTeam(id)),
      dispatch(fetchTeamMembers(id)),
      dispatch(fetchTeamRecipes(id)),
    ])
  }
}

const ConnectedTeam = connect(
  mapStateToProps,
  mapDispatchToProps
)(Team)

export default ConnectedTeam
