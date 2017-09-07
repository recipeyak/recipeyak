import { connect } from 'react-redux'

import { logUserIn } from '../store/actions.js'
import Login from '../components/Login.jsx'

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

const ConnectedLogin = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login)

export default ConnectedLogin
