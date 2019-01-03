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

const mapStateToProps = (state: RootState) => {
  // TODO(chdsbd): Homepage recipes need to be in a seperate list in the store
  const recipes = getRecipes(state)
    .filter(isSuccess)
    .map(x => x.data)
    .sort(
      (x, y) => new Date(y.modified).getTime() - new Date(x.modified).getTime()
    )
  const loadingRecipes = state.recipes.loadingAll && recipes.length === 0
  return {
    userStats: state.user.stats,
    loadingRecipes,
    recipes,
    errorRecipes: state.recipes.errorLoadingAll
  }
}

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
