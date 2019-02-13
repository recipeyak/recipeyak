import { connect } from "react-redux"

import { logUserIn, Dispatch } from "@/store/thunks"
import Login from "@/components/Login"
import { IState } from "@/store/store"
import { setFromUrl, cleareLoginErrors } from "@/store/reducers/auth"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    login: logUserIn(dispatch),
    clearErrors: () => dispatch(cleareLoginErrors()),
    setFromUrl: (url: string) => dispatch(setFromUrl(url))
  }
}

const mapStateToProps = (state: IState) => {
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
