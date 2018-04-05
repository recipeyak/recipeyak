import { connect, Dispatch } from 'react-redux'
import { StateTree } from '../store/store'

import {
  logUserIn,
  setErrorLogin,
  setFromUrl,
} from '../store/actions'
import Login from '../components/Login'

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
  return {
    login: (email: string, password: string, url: string) =>
      dispatch(logUserIn(email, password, url)),
    clearErrors: () => dispatch(setErrorLogin({})),
    setFromUrl: (url: string) => dispatch(setFromUrl(url)),
  }
}

const mapStateToProps = (state: StateTree) => {
  return {
    loading: state.loading.login,
    error: state.error.login,
    errorSocial: state.error.socialLogin,
    fromUrl: state.auth.fromUrl,
  }
}

const ConnectedLogin = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(Login)

export default ConnectedLogin
