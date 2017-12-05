import { connect } from 'react-redux'

import {
  fetchUser,
  updatingEmail,
  loggingOut
} from '../store/actions.js'

import Settings from '../components/Settings.jsx'

const mapStateToProps = state => {
  return {
    avatarURL: state.user.avatarURL,
    email: state.user.email,
    updatingEmail: state.user.updatingEmail
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logout: () => {
      dispatch(loggingOut())
    },
    fetchData: () => {
      dispatch(fetchUser())
    },
    updateEmail: email => {
      dispatch(updatingEmail(email))
    }
  }
}

const ConnectedSettings = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)

export default ConnectedSettings
