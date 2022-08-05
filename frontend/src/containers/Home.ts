import { connect } from "react-redux"

import Home from "@/components/Home"
import { IState } from "@/store/store"
import { Dispatch, fetchingUserAsync } from "@/store/thunks"

const mapStateToProps = (state: IState) => ({
  loggedIn: state.user.loggedIn,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingUserAsync(dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)
