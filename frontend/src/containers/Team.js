import { connect } from 'react-redux'

import {
  fetchTeam,
  fetchTeamMembers,
  fetchTeamInvites,
  fetchTeamRecipes,
} from '../store/actions'

import Team from '../components/Team'

const notUndefined = x => x != null

const mapStateToProps = (state, props) => {
  const id = props.match.params.id
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
      dispatch(fetchTeamInvites(id)),
      dispatch(fetchTeamRecipes(id)),
    ])
  }
}

const ConnectedTeam = connect(
  mapStateToProps,
  mapDispatchToProps
)(Team)

export default ConnectedTeam
