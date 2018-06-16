import { connect } from 'react-redux'

import { reset } from '../store/actions'
import PasswordReset from '../components/PasswordReset'

const mapDispatchToProps = dispatch => ({
  reset: email => dispatch(reset(email))
})

const mapStateToProps = state => ({
  loading: state.loading.reset,
  error: state.error.reset,
  loggedIn: state.user.loggedIn
})

const ConnectedPasswordReset = connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordReset)

export default ConnectedPasswordReset
