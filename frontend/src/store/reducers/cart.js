import {
  SET_CART,
  SET_CART_ITEM
} from '../actionTypes.js'

const cart = (state = {}, action) => {
  switch (action.type) {
    case SET_CART:
      return action.recipes.reduce((a, b) => ({ ...a, [b.recipe]: b.count }), {})
    case SET_CART_ITEM:
      return { ...state, [action.id]: action.count }
    default:
      return state
  }
}

export default cart
