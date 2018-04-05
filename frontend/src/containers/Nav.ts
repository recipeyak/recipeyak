import { connect, Dispatch } from 'react-redux'

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

import { StateTree } from '../store/store'

const mapStateToProps = (state: StateTree) => ({
  avatarURL: state.user.avatarURL,
  email: state.user.email,
  loading: state.user.loading,
  loggedIn: state.user.token != null,
  loggingOut: state.user.loggingOut,
  darkMode: state.user.darkMode,
  teams: teamsFrom(state),
  loadingTeams: state.teams.loading,
})

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
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

const ConnectedNav = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(Nav)

export default ConnectedNav
