import { connect } from 'react-redux'

import { logUserIn } from '../store/actions.js'
import LoginSignup from '../LoginSignup.jsx'

const mapDispatchToProps = dispatch => {
  return {
    login: (email, password) => {
      dispatch(logUserIn(email, password))
    },
  }
}

const ConnectedLoginSignup = connect(
  null,
  mapDispatchToProps,
)(LoginSignup)

export default ConnectedLoginSignup
