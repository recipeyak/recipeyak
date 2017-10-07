import { connect } from 'react-redux'

import { signup } from '../store/actions.js'
import Signup from '../components/Signup.jsx'

const mapDispatchToProps = dispatch => {
  return {
    signup: (email, password1, password2) => dispatch(signup(email, password1, password2))
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
