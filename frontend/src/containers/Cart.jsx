import { connect } from 'react-redux'

import {
  addingToCart,
  removingFromCart,
  fetchCart,
  fetchRecipeList,
} from '../store/actions.js'

import Cart from '../components/Cart.jsx'

export const cartOccurances = (recipes, cart) =>
  Object.entries(
    Object.values(recipes)
    .map(recipe => {
      const count = cart[recipe.id]
      return Array(count).fill(recipe.ingredients).reduce((a, b) => a.concat(b), [])
    })
    .reduce((a, b) => a.concat(b), [])
    .map(x => x.text)
    .reduce((a, b) => {
      if (a[b] !== undefined) {
        return { ...a, [b]: a[b] + 1 }
      } else {
        return { ...a, [b]: 1 }
      }
    }, {})
  ).map(([text, count]) => ({ count, text }))

const mapStateToProps = state => {
  return {
    cart: state.cart,
    recipes: state.recipes,
    loading: state.loading.recipes || state.loading.cart,
    ingredients: cartOccurances(state.recipes, state.cart),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: id => {
      dispatch(addingToCart(id))
    },
    removeFromCart: id => {
      dispatch(removingFromCart(id))
    },
    fetchData: () => {
      dispatch(fetchRecipeList())
      dispatch(fetchCart())
    },
  }
}

const ConnectedCart = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Cart)

export default ConnectedCart
