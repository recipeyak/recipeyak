import { connect } from 'react-redux'

import Home from '../components/Home'

import {
  fetchUser,
  fetchUserStats,
  fetchCart,
  fetchRecipeList,
  addingToCart,
removingFromCart
} from '../store/actions'

const mapStateToProps = state => {
  return {
    loggedIn: state.user.token != null,
    userStats: state.user.stats,
    loadingUserStats: state.user.stats_loading,
    loadingRecipes: state.loading.recipes || state.loading.cart,
    cart: state.cart,
    recipes: state.recipes,
    errorRecipes: state.error.recipes
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchData: () => {
      dispatch(fetchRecipeList())
      dispatch(fetchCart())
      dispatch(fetchUser())
      dispatch(fetchUserStats())
    },
    addToCart: id => dispatch(addingToCart(id)),
    removeFromCart: id => dispatch(removingFromCart(id))
  }
}

const ConnectedHome = connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)

export default ConnectedHome
