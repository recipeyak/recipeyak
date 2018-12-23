import { connect } from "react-redux"

import { NavLink } from "../components/NavLink"

const mapStateToProps = state => {
  return {
    pathname:
      state.routerReducer.location != null
        ? state.routerReducer.location.pathname
        : ""
  }
}

const ConnectedNavLink = connect(mapStateToProps)(NavLink)

export default ConnectedNavLink
