import { connect } from "react-redux"

import { logUserIn, Dispatch } from "@/store/actions"
import Login from "@/components/Login"
import { RootState } from "@/store/store"
import { setFromUrl, setErrorLogin } from "@/store/reducers/auth"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    login: logUserIn(dispatch),
    clearErrors: () => dispatch(setErrorLogin({})),
    setFromUrl: (url: string) => dispatch(setFromUrl(url))
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    loading: state.auth.loadingLogin,
    error: state.auth.errorLogin,
    errorSocial: state.auth.errorSocialLogin,
    fromUrl: state.auth.fromUrl
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
