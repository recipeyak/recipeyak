import {
  SET_SHOPPING_LIST,
  SET_LOADING_SHOPPING_LIST
} from '../actionTypes.js'

const shoppinglist = (state = {}, action) => {
  switch (action.type) {
    case SET_SHOPPING_LIST:
      return { ...state, shoppinglist: action.val }
    case SET_LOADING_SHOPPING_LIST:
      return { ...state, loading: action.val }
    default:
      return state
  }
}

export default shoppinglist
