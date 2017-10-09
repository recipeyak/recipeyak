import { connect } from 'react-redux'

import {
  fetchUser,
  updatingEmail
} from '../store/actions.js'

import Settings from '../components/Settings.jsx'

const mapStateToProps = state => {
  return {
    avatarURL: state.user.avatarURL,
    email: state.user.email
  }
}

const mapDispatchToProps = dispatch => {
  return {
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
