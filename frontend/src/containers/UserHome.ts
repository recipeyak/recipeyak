import { connect } from "react-redux"

import UserHome from "@/components/UserHome"

import {
  fetchingUserStatsAsync,
  Dispatch,
  fetchingRecentRecipesAsync,
  fetchingUserAsync
} from "@/store/thunks"
import { IState } from "@/store/store"
import { getRecentRecipes } from "@/store/reducers/recipes"

const mapStateToProps = (state: IState) => ({
  userStats: state.user.stats,
  recipes: getRecentRecipes(state)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => {
    fetchingRecentRecipesAsync(dispatch)()
    fetchingUserAsync(dispatch)()
    fetchingUserStatsAsync(dispatch)()
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(UserHome)
