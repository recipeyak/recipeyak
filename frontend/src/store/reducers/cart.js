import {
  SET_CART,
  SET_CART_ITEM,
  SET_CLEARING_CART,
  SET_CART_EMPTY
} from '../actionTypes.js'

const cart = (state = {
  clearing: false
}, action) => {
  switch (action.type) {
    case SET_CART:
      return action.recipes.reduce((a, b) => ({ ...a, [b.recipe]: b.count }), {})
    case SET_CART_ITEM:
      return { ...state, [action.id]: action.count }
    case SET_CLEARING_CART:
      return { ...state, clearing: action.val }
    case SET_CART_EMPTY:
      return {}
    default:
      return state
  }
}

export default cart
