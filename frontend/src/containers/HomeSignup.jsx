import { connect } from 'react-redux'

import HomeSignup from '../components/HomeSignup.jsx'

import { signup } from '../store/actions.js'

const mapDispatchToProps = dispatch => {
  return {
    signup: (email, password1, password2) => dispatch(signup(email, password1, password2))
  }
}

const processSignupError = res => {
  return {
    email: res.email != null ? res.email : [],
    password1: res.password1 != null ? res.password1 : [],
    password2: res.password2 != null ? res.password2 : [],
    nonFieldErrors: res.nonFieldErrors != null ? res.nonFieldErrors : []
  }
}

const mapStateToProps = state => {
  return {
    loading: state.loading.signup,
    error: processSignupError(state.error.signup)
  }
}

const ConnectedHomeSignup = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeSignup)

export default ConnectedHomeSignup
