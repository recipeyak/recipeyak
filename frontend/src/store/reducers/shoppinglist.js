import {
  SET_SHOPPING_LIST,
  SET_LOADING_SHOPPING_LIST,
  SET_SHOPPING_LIST_ERROR
} from '../actionTypes.js'

const shoppinglist = (
  state = {
    shoppinglist: []
  }, action) => {
  switch (action.type) {
    case SET_SHOPPING_LIST:
      return { ...state, shoppinglist: action.val }
    case SET_LOADING_SHOPPING_LIST:
      return { ...state, loading: action.val }
    case SET_SHOPPING_LIST_ERROR:
      return { ...state, error: action.val }
    default:
      return state
  }
}

export default shoppinglist
