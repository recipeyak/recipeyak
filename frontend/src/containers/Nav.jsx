import { connect } from 'react-redux'

import {
  fetchUser,
  loggingOut,
  toggleDarkMode,
  fetchTeams,
} from '../store/actions'

import Nav from '../components/Nav'

import {
  teamsFrom
} from '../store/mapState'

const mapStateToProps = state => ({
  avatarURL: state.user.avatarURL,
  email: state.user.email,
  loading: state.user.loading,
  loggedIn: state.user.loggedIn,
  loggingOut: state.user.loggingOut,
  darkMode: state.user.darkMode,
  teams: teamsFrom(state),
  loadingTeams: state.teams.loading,
  scheduleURL: state.user.scheduleURL,
})

const mapDispatchToProps = dispatch => {
  return {
    fetchData: () => {
      dispatch(fetchTeams())
      dispatch(fetchUser())
    },
    logout: () => {
      dispatch(loggingOut())
    },
    toggleDarkMode: () =>
      dispatch(toggleDarkMode())
  }
}

const ConnectedNav = connect(
  mapStateToProps,
  mapDispatchToProps
)(Nav)

export default ConnectedNav
