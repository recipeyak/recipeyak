import { connect } from 'react-redux'

import {
  loggingOut,
  fetchUser
} from '../store/actions.js'

import Nav from '../components/Nav.jsx'

const mapStateToProps = state => {
  return {
    avatarURL: state.user.avatarURL,
    loading: state.user.loading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logout: () => {
      dispatch(loggingOut())
    },
    fetchData: () => {
      dispatch(fetchUser())
    }
  }
}

const ConnectedNav = connect(
  mapStateToProps,
  mapDispatchToProps
)(Nav)

export default ConnectedNav
