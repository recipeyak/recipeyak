import { connect } from 'react-redux'

import { reset } from '../store/actions.js'
import PasswordReset from '../components/PasswordReset.jsx'

const mapDispatchToProps = dispatch => {
  return {
    reset: (email, password) => dispatch(reset(email))
  }
}

const mapStateToProps = state => {
  return {
    loading: state.loading.reset,
    error: state.error.reset
  }
}

const ConnectedPasswordReset = connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordReset)

export default ConnectedPasswordReset
