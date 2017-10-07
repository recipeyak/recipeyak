import { connect } from 'react-redux'

import {
  updatingPassword
} from '../store/actions.js'

import PasswordChange from '../components/PasswordChange.jsx'

const mapDispatchToProps = dispatch => {
  return {
    update: (password1, password2, oldPassword) => {
      dispatch(updatingPassword(password1, password2, oldPassword))
    }
  }
}

const mapStateToProps = state => {
  return {
    loading: state.settings.loadingPasswordUpdate,
    error: state.settings.errorPasswordUpdate
  }
}

const ConnectedPasswordChange = connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordChange)

export default ConnectedPasswordChange
