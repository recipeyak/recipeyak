import {
  SET_SHOPPING_LIST,
  SET_LOADING_SHOPPING_LIST,
  SET_SHOPPING_LIST_ERROR
} from '../actionTypes'

export interface ShoppingListItem {
  name: string
  unit: string
}

export interface SetShoppingList {
  type: typeof SET_SHOPPING_LIST
  val: ShoppingListItem[]
}

interface SetLoadingShoppingList {
  type: typeof SET_LOADING_SHOPPING_LIST
  val: boolean
}

interface SetShoppingListError {
  type: typeof SET_SHOPPING_LIST_ERROR
  val: boolean
}

type ShoppingListActions = SetShoppingList
  | SetLoadingShoppingList
  | SetShoppingListError

const initialState = {
  shoppinglist: [] as ShoppingListItem[],
  // TODO: does defaulting to false mess with the UI?
  loading: false,
  error: false,
}

export type ShoppingListState = typeof initialState

const shoppinglist = (
  state = initialState, action: ShoppingListActions) => {
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
