import { connect } from 'react-redux'

import {
  fetchUser,
  loggingOut,
  toggleDarkMode
} from '../store/actions'

import Nav from '../components/Nav'

const mapStateToProps = state => ({
  avatarURL: state.user.avatarURL,
  email: state.user.email,
  loading: state.user.loading,
  loggedIn: state.user.token != null,
  loggingOut: state.user.loggingOut,
  darkMode: state.user.darkMode
})

const mapDispatchToProps = dispatch => {
  return {
    fetchData: () => {
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
