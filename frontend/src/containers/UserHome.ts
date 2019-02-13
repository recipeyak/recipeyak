import { connect } from "react-redux"

import UserHome from "@/components/UserHome"

import {
  fetchingUserStats,
  Dispatch,
  fetchingRecentRecipes,
  fetchingUser
} from "@/store/thunks"
import { IState } from "@/store/store"
import { getRecentRecipes } from "@/store/reducers/recipes"

const mapStateToProps = (state: IState) => ({
  userStats: state.user.stats,
  recipes: getRecentRecipes(state)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => {
    fetchingRecentRecipes(dispatch)()
    fetchingUser(dispatch)()
    fetchingUserStats(dispatch)()
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHome)
