import { connect } from "react-redux"

import { NavLink } from "../components/NavLink"
import { RootState } from "../store/store"

const mapStateToProps = (state: RootState) => {
  return {
    pathname:
      state.routerReducer.location != null
        ? state.routerReducer.location.pathname
        : ""
  }
}

export default connect(mapStateToProps)(NavLink)
