import { connect } from 'react-redux'

import {
  logUserIn,
  setErrorLogin,
  setFromUrl,
} from '../store/actions'
import Login from '../components/Login'

const mapDispatchToProps = dispatch => {
  return {
    login: (email, password, url) => dispatch(logUserIn(email, password, url)),
    clearErrors: () => dispatch(setErrorLogin({})),
    setFromUrl: url => dispatch(setFromUrl(url)),
  }
}

const mapStateToProps = state => {
  return {
    loading: state.loading.login,
    error: state.error.login,
    errorSocial: state.error.socialLogin,
    fromUrl: state.auth.fromUrl,
  }
}

const ConnectedLogin = connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)

export default ConnectedLogin
