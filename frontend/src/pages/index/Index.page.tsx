import { connect } from "react-redux"

import LandingPage from "@/pages/index/LandingPage"
import UserHome from "@/pages/index/UserHome"
import type { IState } from "@/store/store"
import type { Dispatch } from "@/store/thunks"
import { fetchingUserAsync } from "@/store/thunks"

const Home = ({ loggedIn }: { loggedIn: boolean }) =>
  loggedIn ? <UserHome /> : <LandingPage />

const mapStateToProps = (state: IState) => ({
  loggedIn: state.user.loggedIn,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingUserAsync(dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)
