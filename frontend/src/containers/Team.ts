import { connect } from "react-redux"

import {
  fetchingTeamAsync,
  fetchingTeamMembersAsync,
  fetchingTeamRecipesAsync,
  deletingTeamAsync,
  updatingTeamAsync,
  Dispatch,
} from "@/store/thunks"
import Team from "@/components/Team"
import { IState } from "@/store/store"
import { RouteComponentProps } from "react-router"
import { ITeam } from "@/store/reducers/teams"
import { notUndefined } from "@/utils/general"

type RouteProps = RouteComponentProps<{ id: string }>

const mapStateToProps = (state: IState, props: RouteProps) => {
  const id = parseInt(props.match.params.id, 10)
  const team = state.teams.byId[id]

  // TODO(sbdchd): clean up this mess

  const isSettings = props.match.url.endsWith("settings")

  const members = team == null || team.members == null ? [] : team.members

  const teamMembers = Object.values(members).filter(notUndefined)

  const loadingTeam = team ? !!team.loadingTeam && !team.name : false
  const loadingMembers = team
    ? !!team.loadingMembers && teamMembers.length === 0
    : false

  return {
    id,
    members: teamMembers,
    isSettings,
    error404: team ? !!team.error404 : false,
    loadingTeam,
    name: team ? team.name : "",
    loadingMembers,
  }
}
const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    fetchData: (id: ITeam["id"]) =>
      Promise.all([
        fetchingTeamAsync(dispatch)(id),
        fetchingTeamMembersAsync(dispatch)(id),
        fetchingTeamRecipesAsync(dispatch)(id),
      ]),
    deleteTeam: deletingTeamAsync(dispatch),
    updatingTeam: updatingTeamAsync(dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Team)
