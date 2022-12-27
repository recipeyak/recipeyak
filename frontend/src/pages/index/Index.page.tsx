import { connect } from "react-redux"

import LandingPage from "@/pages/index/LandingPage"
import UserHome from "@/pages/index/UserHome"
import { IState } from "@/store/store"

const Home = ({ loggedIn }: { loggedIn: boolean }) =>
  loggedIn ? <UserHome /> : <LandingPage />

const mapStateToProps = (state: IState) => ({
  loggedIn: state.user.loggedIn,
})

export default connect(mapStateToProps)(Home)
