import { connect } from "react-redux"

import { signup, setErrorSignup, Dispatch } from "../store/actions"
import Signup from "../components/Signup"
import { RootState } from "../store/store"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    signup: (email: string, password1: string, password2: string) =>
      dispatch(signup(email, password1, password2)),
    clearErrors: () => dispatch(setErrorSignup({}))
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    loading: state.loading.signup,
    error: state.error.signup
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup)
