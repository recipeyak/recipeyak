import { connect } from 'react-redux'

import UserHome from '../components/UserHome'

import {
  fetchUser,
  fetchUserStats,
  fetchCart,
  fetchRecipeList,
  addingToCart,
  removingFromCart
} from '../store/actions'

const mapStateToProps = state => ({
  userStats: state.user.stats,
  loadingUserStats: state.user.stats_loading,
  loadingRecipes: state.loading.recipes || state.loading.cart,
  cart: state.cart,
  recipes: state.recipes,
  errorRecipes: state.error.recipes
})

const mapDispatchToProps = dispatch => ({
  fetchData: () => {
    dispatch(fetchRecipeList())
    dispatch(fetchCart())
    dispatch(fetchUser())
    dispatch(fetchUserStats())
  },
  addToCart: id => dispatch(addingToCart(id)),
  removeFromCart: id => dispatch(removingFromCart(id))
})

const ConnectedUserHome = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHome)

export default ConnectedUserHome
