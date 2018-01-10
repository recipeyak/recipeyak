import { connect } from 'react-redux'

import {
  addingToCart,
  removingFromCart,
  updatingCart
} from '../store/actions'

import RecipeItem from '../components/RecipeItem'

// define default actions that can be overridden for cart which has some extra
// data fetching after updating cart amount
const mapDispatchToProps = (dispatch, {
  updateCart = (id, count) => dispatch(updatingCart(id, count)),
  removeFromCart = id => dispatch(removingFromCart(id)),
  addToCart = id => dispatch(addingToCart(id))
}) => ({
  addToCart,
  removeFromCart,
  updateCart
})

const ConnectedRecipeItem = connect(
  null,
  mapDispatchToProps
)(RecipeItem)

export default ConnectedRecipeItem
