import { connect } from 'react-redux'

import { push } from 'react-router-redux'

import {
  fetchUser
} from '../store/actions.js'

import Nav from '../components/Nav.jsx'

const mapStateToProps = state => {
  return {
    avatarURL: state.user.avatarURL,
    loading: state.user.loading,
    loggedIn: state.user.token != null
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchData: () => {
      dispatch(fetchUser())
    },
    navigateTo: location => {
      dispatch(push(location))
    }
  }
}

const ConnectedNav = connect(
  mapStateToProps,
  mapDispatchToProps
)(Nav)

export default ConnectedNav
