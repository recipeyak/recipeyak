import { connect } from "react-redux"
import { RouteComponentProps } from "react-router"

import Team from "@/components/Team"
import { ITeam } from "@/store/reducers/teams"
import { IState } from "@/store/store"
import {
  deletingTeamAsync,
  Dispatch,
  fetchingTeamAsync,
  fetchingTeamMembersAsync,
  updatingTeamAsync,
} from "@/store/thunks"
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
  const loadingMembers = team?.loadingMembers ?? true

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
      ]),
    deleteTeam: deletingTeamAsync(dispatch),
    updatingTeam: updatingTeamAsync(dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Team)
