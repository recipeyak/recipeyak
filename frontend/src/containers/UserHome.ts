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
  // TODO(chdsbd): Update store to use byId, allId structure
  // tslint:disable:no-unsafe-any
  recipes: Object.values(state.recipes).sort(
    (x, y) => new Date(y.modified).getTime() - new Date(x.modified).getTime()
  ),
  // tslint:enable:no-unsafe-any
  errorRecipes: state.error.recipes
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => {
    fetchRecentRecipes(dispatch)()
    fetchUser(dispatch)()
    fetchUserStats(dispatch)()
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHome)
