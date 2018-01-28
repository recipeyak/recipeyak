import { connect } from 'react-redux'

import {
  fetchUser,
  fetchSocialConnections,
  updatingEmail,
  disconnectSocialAccount,
  loggingOut
} from '../store/actions.js'

import Settings from '../components/Settings.jsx'

const mapStateToProps = state => {
  return {
    avatarURL: state.user.avatarURL,
    email: state.user.email,
    updatingEmail: state.user.updatingEmail,
    hasPassword: state.user.hasUsablePassword,
    socialAccountConnections: state.user.socialAccountConnections,
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
      dispatch(fetchSocialConnections())
    },
    disconnectAccount: (provider, id) => dispatch(disconnectSocialAccount(provider, id)),
    updateEmail: email => dispatch(updatingEmail(email))
  }
}

const ConnectedSettings = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)

export default ConnectedSettings
