import { connect } from "react-redux"

import Home from "../components/Home"

import { fetchUser, Dispatch } from "../store/actions"
import { RootState } from "../store/store"

const mapStateToProps = (state: RootState) => ({
  loggedIn: state.user.loggedIn
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => dispatch(fetchUser())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
