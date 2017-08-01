// we are expecting the state to be in the following format:
// {
//  ID: NUMBER_OF_TIMES_IN_CART,
//  1: 3,
// }
// However, if it isn't in the cart, we just remove it, we do not set its
// times in the cart to 0

import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
} from './actionTypes.js'

const cart = (state = {}, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      if (state[action.id] === undefined) {
        return Object.assign({}, state, { [action.id]: 1 })
      }
      return Object.assign({}, state, { [action.id]: state[action.id] + 1 })
    case REMOVE_FROM_CART:
      if (state[action.id] === 0 || state[action.id] === undefined) {
        return state
      }
      return Object.assign({}, state, { [action.id]: state[action.id] - 1 })
    default:
      return state
  }
}

export default cart
