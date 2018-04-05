import { connect, Dispatch } from 'react-redux'

import {
  signup,
  setErrorSignup
} from '../store/actions'

import Signup from '../components/Signup'

import { StateTree } from '../store/store'

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
  return {
    signup: (email: string, password1: string, password2: string) =>
            dispatch(signup(email, password1, password2)),
    clearErrors: () => dispatch(setErrorSignup({}))
  }
}

const mapStateToProps = (state: StateTree) => {
  return {
    loading: state.loading.signup,
    error: state.error.signup
  }
}

const ConnectedLoginSignup = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(Signup)

export default ConnectedLoginSignup
