import { connect, Dispatch } from 'react-redux'

import { StateTree } from '../store/store'

import { reset } from '../store/actions'
import PasswordReset from '../components/PasswordReset'

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => ({
  reset: (email: string) => dispatch(reset(email))
})

const mapStateToProps = (state: StateTree) => ({
  loading: state.loading.reset,
  error: state.error.reset,
  loggedIn: state.user.token != null
})

const ConnectedPasswordReset = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(PasswordReset)

export default ConnectedPasswordReset
