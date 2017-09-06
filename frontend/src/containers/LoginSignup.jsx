import { connect } from 'react-redux'

import { logUserIn } from '../store/actions.js'
import LoginSignup from '../LoginSignup.jsx'

const mapDispatchToProps = dispatch => {
  return {
    login: (email, password) => dispatch(logUserIn(email, password)),
  }
}

const mapStateToProps = state => {
  return {
    loading: state.loading.login,
    error: state.error.login,
  }
}

const ConnectedLoginSignup = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginSignup)

export default ConnectedLoginSignup
