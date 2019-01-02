import { connect } from "react-redux"

import UserHome from "@/components/UserHome"

import {
  fetchUser,
  fetchingUserStats,
  fetchRecentRecipes,
  Dispatch
} from "@/store/actions"
import { RootState } from "@/store/store"
import { getRecipes } from "@/store/reducers/recipes"
import { isSuccess } from "@/store/remotedata"

const mapStateToProps = (state: RootState) => ({
  userStats: state.user.stats,
  loadingRecipes: state.recipes.loadingAll,
  recipes: getRecipes(state)
    .filter(isSuccess)
    .map(x => x.data)
    .sort(
      (x, y) => new Date(y.modified).getTime() - new Date(x.modified).getTime()
    ),
  errorRecipes: state.recipes.errorLoadingAll
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => {
    fetchRecentRecipes(dispatch)()
    fetchUser(dispatch)()
    fetchingUserStats(dispatch)()
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHome)
