import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  SET_CART,
  SET_CART_ITEM,
} from '../actionTypes.js'

const cart = (state = {}, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      if (state[action.id] === undefined) {
        return { ...state, [action.id]: 1 }
      }
      return { ...state, [action.id]: state[action.id] + 1 }
    case REMOVE_FROM_CART:
      if (state[action.id] === 0 || state[action.id] === undefined) {
        return state
      }
      return { ...state, [action.id]: state[action.id] - 1 }
    case SET_CART:
      return action.recipes.reduce((a, b) => ({ ...a, [b.recipe]: b.count }), {})
    case SET_CART_ITEM:
      return { ...state, [action.id]: action.count }
    default:
      return state
  }
}

export default cart
