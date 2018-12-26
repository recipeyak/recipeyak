import { connect } from "react-redux"

import { signup, Dispatch } from "@/store/actions"
import Signup from "@/components/Signup"
import { RootState } from "@/store/store"
import { setErrorSignup } from "@/store/reducers/error"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    signup: signup(dispatch),
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
