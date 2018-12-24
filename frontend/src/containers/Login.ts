import { connect } from "react-redux"

import {
  logUserIn,
  setErrorLogin,
  setFromUrl,
  Dispatch
} from "../store/actions"
import Login from "../components/Login"
import { RootState } from "../store/store"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    login: (email: string, password: string, url: string) =>
      dispatch(logUserIn(email, password, url)),
    clearErrors: () => dispatch(setErrorLogin({})),
    setFromUrl: (url: string) => dispatch(setFromUrl(url))
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    loading: state.loading.login,
    error: state.error.login,
    errorSocial: state.error.socialLogin,
    fromUrl: state.auth.fromUrl
  }
}

const ConnectedLogin = connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)

export default ConnectedLogin
