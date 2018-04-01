import { connect, Dispatch } from 'react-redux'

import { StateTree } from '../store/store'

import { resetConfirmation as reset } from '../store/actions'
import PasswordResetConfirmation from '../components/PasswordResetConfirmation'

interface PasswordResetRouterProps {
  match: {
    params: {
      uid: string
      token: string
    }
  }
}

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => ({
  reset: (uid: string, token: string, newPassword1: string, newPassword2: string) => {
    dispatch(reset(uid, token, newPassword1, newPassword2))
  }
})

const mapStateToProps = (state: StateTree, props: PasswordResetRouterProps) => {
  const uid = props.match.params.uid
  const token = props.match.params.token
  return {
    uid,
    token,
    loading: state.loading.resetConfirmation,
    error: state.error.resetConfirmation
  }
}

const ConnectedPasswordReset = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(PasswordResetConfirmation)

export default ConnectedPasswordReset
