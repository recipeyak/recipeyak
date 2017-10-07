import { connect } from 'react-redux'

import { loggingOut } from '../store/actions.js'
import Nav from '../components/Nav.jsx'

const mapDispatchToProps = dispatch => {
  return {
    logout: () => {
      dispatch(loggingOut())
    },
  }
}

const ConnectedNav = connect(
  null,
  mapDispatchToProps,
)(Nav)

export default ConnectedNav
