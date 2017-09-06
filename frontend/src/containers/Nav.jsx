import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { logout } from '../store/actions.js'
import Nav from '../Nav.jsx'

const mapDispatchToProps = dispatch => {
  return {
    logout: () => {
      dispatch(logout())
      dispatch(push('/login'))
    },
  }
}

const ConnectedNav = connect(
  null,
  mapDispatchToProps,
)(Nav)

export default ConnectedNav
