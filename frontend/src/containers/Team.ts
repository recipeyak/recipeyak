import { connect, Dispatch } from 'react-redux'
import {
    History,
    Location,
} from 'history'

import {
  fetchTeam,
  fetchTeamMembers,
  fetchTeamRecipes,
  deletingTeam,
  updatingTeam,
} from '../store/actions'

import {
  TeamOptional
} from '../store/reducers/teams'


import { StateTree } from '../store/store'

import Team from '../components/Team'

const notUndefined = (x: any) => x != null

export interface RouterProps {
    match: {
        path: string
        url: string
        params: any
        isExact: boolean
    }
    location: Location
    history: History
}

const mapStateToProps = (state: StateTree, props: RouterProps) => {
  const id = parseInt(props.match.params.id, 10)
  const team = state.teams[id]

  const isSettings = props.match.url.endsWith('settings')

  const recipes = team.recipes || []

  return {
    ...team,
    id,
    isSettings,
    recipes: recipes.map(id => state.recipes[id]).filter(notUndefined)
  }
}

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
  return {
    fetchData: (id: number) => Promise.all([
      dispatch(fetchTeam(id)),
      dispatch(fetchTeamMembers(id)),
      dispatch(fetchTeamRecipes(id)),
    ]),
    deleteTeam: (id: number) => dispatch(deletingTeam(id)),
    updatingTeam: (teamId: number, team: TeamOptional) => dispatch(updatingTeam(teamId, team))
  }
}

const ConnectedTeam = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(Team)

export default ConnectedTeam
