import { connect } from 'react-redux'

import {
  fetchUser
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
    }
  }
}

const ConnectedSettings = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)

export default ConnectedSettings
