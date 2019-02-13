import { connect } from "react-redux"

import { signup, Dispatch } from "@/store/thunks"
import Signup from "@/components/Signup"
import { IState } from "@/store/store"
import { setErrorSignup } from "@/store/reducers/auth"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    signup: signup(dispatch),
    clearErrors: () => dispatch(setErrorSignup({}))
  }
}

const mapStateToProps = (state: IState) => {
  return {
    loading: state.auth.loadingSignup,
    error: state.auth.errorSignup
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup)
