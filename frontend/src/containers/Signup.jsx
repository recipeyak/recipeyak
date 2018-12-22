import { connect } from "react-redux"

import { signup, setErrorSignup } from "../store/actions"
import Signup from "../components/Signup.jsx"

const mapDispatchToProps = dispatch => {
  return {
    signup: (email, password1, password2) =>
      dispatch(signup(email, password1, password2)),
    clearErrors: () => dispatch(setErrorSignup({}))
  }
}

const mapStateToProps = state => {
  return {
    loading: state.loading.signup,
    error: state.error.signup
  }
}

const ConnectedLoginSignup = connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup)

export default ConnectedLoginSignup
