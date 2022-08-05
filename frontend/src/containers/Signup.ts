import { connect } from "react-redux"

import Signup from "@/components/Signup"
import { setErrorSignup } from "@/store/reducers/auth"
import { IState } from "@/store/store"
import { Dispatch, signupAsync } from "@/store/thunks"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    signup: signupAsync(dispatch),
    clearErrors: () => dispatch(setErrorSignup({})),
  }
}

const mapStateToProps = (state: IState) => {
  return {
    loading: state.auth.loadingSignup,
    error: state.auth.errorSignup,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup)
