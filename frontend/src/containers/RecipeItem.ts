import { connect, Dispatch } from 'react-redux'

import { StateTree } from '../store/store'

import {
  addingToCart,
  removingFromCart,
  updatingCart
} from '../store/actions'

import RecipeItem from '../components/RecipeItem'

// define default actions that can be overridden for cart which has some extra
// data fetching after updating cart amount
const mapDispatchToProps = (dispatch: Dispatch<StateTree>, {
  updateCart = (id: number, count: number) => dispatch(updatingCart(id, count)),
  removeFromCart = (id: number) => dispatch(removingFromCart(id)),
  addToCart = (id: number) => dispatch(addingToCart(id))
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
