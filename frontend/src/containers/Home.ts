import { connect } from "react-redux"

import Home from "@/components/Home"

import { Dispatch, fetchingUser } from "@/store/thunks"
import { RootState } from "@/store/store"

const mapStateToProps = (state: RootState) => ({
  loggedIn: state.user.loggedIn
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingUser(dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
