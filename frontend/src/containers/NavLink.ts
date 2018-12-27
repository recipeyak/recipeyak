import { connect } from "react-redux"

import { NavLink } from "@/components/NavLink"
import { RootState } from "@/store/store"

const mapStateToProps = (state: RootState) => ({
  pathname:
    state.routerReducer.location != null
      ? state.routerReducer.location.pathname
      : ""
})

// pass {} to prevent passing `dispatch` to component
export default connect(
  mapStateToProps,
  {}
)(NavLink)
