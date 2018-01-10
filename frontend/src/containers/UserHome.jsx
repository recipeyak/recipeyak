import { connect } from 'react-redux'

import UserHome from '../components/UserHome'

import {
  fetchUser,
  fetchUserStats,
  fetchCart,
  fetchRecentRecipes,
  addingToCart,
  removingFromCart,
  updatingCart
} from '../store/actions'

const mapStateToProps = state => ({
  userStats: state.user.stats,
  loadingUserStats: state.user.stats_loading,
  loadingRecipes: state.loading.recipes || state.loading.cart,
  cart: state.cart,
  recipes: Object.values(state.recipes)
           .sort((x, y) => new Date(y.modified) > new Date(x.modified)),
  errorRecipes: state.error.recipes
})

const mapDispatchToProps = dispatch => ({
  fetchData: () => {
    dispatch(fetchRecentRecipes())
    dispatch(fetchCart())
    dispatch(fetchUser())
    dispatch(fetchUserStats())
  },
  addToCart: id => dispatch(addingToCart(id)),
  removeFromCart: id => dispatch(removingFromCart(id)),
  updateCart: (id, count) => dispatch(updatingCart(id, count))
})

const ConnectedUserHome = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHome)

export default ConnectedUserHome
