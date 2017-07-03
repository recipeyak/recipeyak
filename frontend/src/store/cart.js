import {deepCopy} from '../helpers.js'

const cart = (state = {}, action) => {
  // const cart = deepCopy(state)
  switch (action.type) {
    case 'ADD_TO_CART':
      if (state[action.id] === undefined) {
        return Object.assign({}, state, {[action.id]: 1})
      }
      return Object.assign({}, state, {[action.id]: state[action.id] + 1})
    case 'REMOVE_FROM_CART':
      if (state[action.id] === 0 || state[action.id] === undefined) {
        return state
      }
      return Object.assign({}, state, {[action.id]: state[action.id] - 1})
    default:
      return state
  }
}

export default cart
