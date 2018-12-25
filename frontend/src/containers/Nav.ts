import { connect } from "react-redux"

import {
  fetchUser,
  loggingOut,
  fetchTeams,
  Dispatch
} from "../store/actions"

import Nav from "../components/Nav"

import { teamsFrom, scheduleURLFromTeamID } from "../store/mapState"
import { RootState } from "../store/store"
import { IUserState, toggleDarkMode } from "../store/reducers/user"

const mapStateToProps = (state: RootState) => ({
  avatarURL: state.user.avatarURL,
  email: state.user.email,
  loading: state.user.loading,
  loggedIn: state.user.loggedIn,
  loggingOut: state.user.loggingOut,
  darkMode: state.user.darkMode,
  teams: teamsFrom(state),
  loadingTeams: state.teams.loading,
  scheduleURL: scheduleURLFromTeamID(state),
  teamID: (state.user as IUserState).teamID
})

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    fetchData: () => {
      dispatch(fetchTeams())
      dispatch(fetchUser())
    },
    logout: () => {
      dispatch(loggingOut())
    },
    toggleDarkMode: () => dispatch(toggleDarkMode())
  }
}

const ConnectedNav = connect(
  mapStateToProps,
  mapDispatchToProps
)(Nav)

export default ConnectedNav
