import { connect, Dispatch } from 'react-redux'

import UserHome from '../components/UserHome'

import {
  StateTree
} from '../store/store'

import {
  fetchUser,
  fetchUserStats,
  fetchRecentRecipes
} from '../store/actions'

import {
  byModifiedTime
} from '../sorters'

const mapStateToProps = (state: StateTree) => ({
  userStats: state.user.stats,
  loadingUserStats: state.user.stats_loading,
  loadingRecipes: state.loading.recipes || state.loading.cart,
  cart: state.cart,
  recipes: Object.values(state.recipes)
           .sort(byModifiedTime),
  errorRecipes: state.error.recipes
})

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => ({
  fetchData: () => {
    dispatch(fetchRecentRecipes())
    dispatch(fetchUser())
    dispatch(fetchUserStats())
  }
})

const ConnectedUserHome = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(UserHome)

export default ConnectedUserHome
