import { connect } from "react-redux"

import Home from "@/components/Home"

import { Dispatch, fetchingUserAsync } from "@/store/thunks"
import { IState } from "@/store/store"

const mapStateToProps = (state: IState) => ({
  loggedIn: state.user.loggedIn
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingUserAsync(dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)
