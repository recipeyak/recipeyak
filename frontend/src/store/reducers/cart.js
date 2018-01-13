import {
  SET_CLEARING_CART
} from '../actionTypes'

const cart = (state = {
  clearing: false
}, action) => {
  switch (action.type) {
    case SET_CLEARING_CART:
      return { ...state, clearing: action.val }
    default:
      return state
  }
}

export default cart
