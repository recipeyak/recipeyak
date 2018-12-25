import { connect } from "react-redux"

import UserHome from "../components/UserHome"

import {
  fetchUser,
  fetchUserStats,
  fetchRecentRecipes,
  Dispatch
} from "../store/actions"
import { RootState } from "../store/store"

const mapStateToProps = (state: RootState) => ({
  userStats: state.user.stats,
  loadingUserStats: state.user.stats_loading,
  loadingRecipes: state.loading.recipes,
  recipes: Object.values(state.recipes).sort(
    (x, y) => new Date(y.modified).getTime() - new Date(x.modified).getTime()
  ),
  errorRecipes: state.error.recipes
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => {
    dispatch(fetchRecentRecipes())
    dispatch(fetchUser())
    dispatch(fetchUserStats())
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHome)
