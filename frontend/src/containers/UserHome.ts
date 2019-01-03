import { connect } from "react-redux"

import UserHome from "@/components/UserHome"

import {
  fetchUser,
  fetchingUserStats,
  Dispatch,
  fetchingRecentRecipes
} from "@/store/actions"
import { RootState } from "@/store/store"
import { getRecentRecipes } from "@/store/reducers/recipes"

const mapStateToProps = (state: RootState) => ({
  userStats: state.user.stats,
  recipes: getRecentRecipes(state)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => {
    fetchingRecentRecipes(dispatch)()
    fetchUser(dispatch)()
    fetchingUserStats(dispatch)()
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHome)
