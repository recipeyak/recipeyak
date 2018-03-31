import { connect } from 'react-redux'

import { NavLink } from '../components/NavLink'
import { StateTree } from '../store/store'

const mapStateToProps = (state: StateTree) => {
  return {
    pathname: state.routerReducer.location != null
      ? state.routerReducer.location.pathname
      : ''
  }
}

const ConnectedNavLink = connect(
  mapStateToProps
)(NavLink)

export default ConnectedNavLink
