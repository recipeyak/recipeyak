import { connect } from 'react-redux'

import { resetConfirmation as reset } from '../store/actions'
import PasswordResetConfirmation from '../components/PasswordResetConfirmation'

const mapDispatchToProps = dispatch => {
  return {
    reset: (uid, token, newPassword1, newPassword2) => dispatch(reset(uid, token, newPassword1, newPassword2))
  }
}

const mapStateToProps = (state, props) => {
  const uid = props.match.params.uid
  const token = props.match.params.token
  return {
    uid,
    token,
    loading: state.loading.resetConfirmation,
    error: state.error.resetConfirmation
  }
}

const ConnectedPasswordReset = connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordResetConfirmation)

export default ConnectedPasswordReset
