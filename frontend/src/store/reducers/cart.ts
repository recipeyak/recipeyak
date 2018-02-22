import {
  SET_CLEARING_CART
} from '../actionTypes'

interface CartAction {
  type: typeof SET_CLEARING_CART
  val: boolean
}

const cart = (state = {
  clearing: false
}, action: CartAction) => {
  switch (action.type) {
  case SET_CLEARING_CART:
    return { ...state, clearing: action.val }
  default:
    return state
  }
}

export default cart
