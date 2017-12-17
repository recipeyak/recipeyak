import { connect } from 'react-redux'

import {
  fetchUser,
  loggingOut
} from '../store/actions'

import Nav from '../components/Nav'

const mapStateToProps = state => ({
  avatarURL: state.user.avatarURL,
  email: state.user.email,
  loading: state.user.loading,
  loggedIn: state.user.token != null,
  loggingOut: state.user.loggingOut
})

const mapDispatchToProps = dispatch => {
  return {
    fetchData: () => {
      dispatch(fetchUser())
    },
    logout: () => {
      dispatch(loggingOut())
    }
  }
}

const ConnectedNav = connect(
  mapStateToProps,
  mapDispatchToProps
)(Nav)

export default ConnectedNav
