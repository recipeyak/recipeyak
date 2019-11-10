import { connect } from "react-redux"

import {
  fetchingUserAsync,
  loggingOutAsync,
  fetchingTeamsAsync,
  Dispatch
} from "@/store/thunks"

import Nav from "@/components/Nav"

import { teamsFrom, scheduleURLFromTeamID } from "@/store/mapState"
import { IState } from "@/store/store"
import { toggleDarkMode } from "@/store/reducers/user"

const mapStateToProps = (state: IState) => ({
  avatarURL: state.user.avatarURL,
  email: state.user.email,
  loading: state.user.loading,
  loggedIn: state.user.loggedIn,
  loggingOut: state.user.loggingOut,
  darkMode: state.user.darkMode,
  teams: teamsFrom(state),
  loadingTeams: !!state.teams.loading,
  scheduleURL: scheduleURLFromTeamID(state),
  teamID: state.user.teamID
})

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    fetchData: () => {
      fetchingTeamsAsync(dispatch)()
      fetchingUserAsync(dispatch)()
    },
    logout: () => {
      loggingOutAsync(dispatch)()
    },
    toggleDarkMode: () => dispatch(toggleDarkMode())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav)
