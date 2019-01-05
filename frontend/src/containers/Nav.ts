import { connect } from "react-redux"

import {
  fetchingUser,
  loggingOut,
  fetchingTeams,
  Dispatch
} from "@/store/actions"

import Nav from "@/components/Nav"

import { teamsFrom, scheduleURLFromTeamID } from "@/store/mapState"
import { RootState } from "@/store/store"
import { toggleDarkMode } from "@/store/reducers/user"

const mapStateToProps = (state: RootState) => ({
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
      fetchingTeams(dispatch)()
      fetchingUser(dispatch)()
    },
    logout: () => {
      loggingOut(dispatch)()
    },
    toggleDarkMode: () => dispatch(toggleDarkMode())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Nav)
