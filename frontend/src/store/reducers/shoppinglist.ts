import addWeeks from "date-fns/add_weeks"
import startOfToday from "date-fns/start_of_today"

import {
  SET_SHOPPING_LIST,
  SET_LOADING_SHOPPING_LIST,
  SET_SHOPPING_LIST_ERROR,
  SET_SELECTING_START,
  SET_SELECTING_END
} from "../actionTypes"
import { AnyAction } from "redux"

export interface IShoppingListItem {
  readonly name: string
  readonly unit: string
}

export interface IShoppingListState {
  readonly shoppinglist: IShoppingListItem[]
  readonly loading: boolean
  readonly error: boolean
  readonly startDay: Date
  readonly endDay: Date
}

const initialState: IShoppingListState = {
  shoppinglist: [],
  loading: false,
  error: false,
  startDay: startOfToday(),
  endDay: addWeeks(startOfToday(), 1)
}

const shoppinglist = (
  state: IShoppingListState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case SET_SHOPPING_LIST:
      return { ...state, shoppinglist: action.val }
    case SET_LOADING_SHOPPING_LIST:
      return { ...state, loading: action.val }
    case SET_SHOPPING_LIST_ERROR:
      return { ...state, error: action.val }
    case SET_SELECTING_START:
      return { ...state, startDay: action.date }
    case SET_SELECTING_END:
      return { ...state, endDay: action.date }
    default:
      return state
  }
}

export default shoppinglist
