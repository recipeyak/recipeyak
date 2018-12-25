import addWeeks from "date-fns/add_weeks"
import startOfToday from "date-fns/start_of_today"

import { action as act } from "typesafe-actions"

const SET_SHOPPING_LIST = "SET_SHOPPING_LIST"
const SET_LOADING_SHOPPING_LIST = "SET_LOADING_SHOPPING_LIST"
const SET_SHOPPING_LIST_ERROR = "SET_SHOPPING_LIST_ERROR"
const SET_SELECTING_START = "SET_SELECTING_START"
const SET_SELECTING_END = "SET_SELECTING_END"

export const setShoppingList = (val: IShoppingListItem[]) =>
  act(SET_SHOPPING_LIST, val)

export const setShoppingListEmpty = () => setShoppingList([])

export const setLoadingShoppingList = (val: boolean) =>
  act(SET_LOADING_SHOPPING_LIST, val)

export const setShoppingListError = (val: boolean) =>
  act(SET_SHOPPING_LIST_ERROR, val)

export const setSelectingStart = (date: Date) => act(SET_SELECTING_START, date)

export const setSelectingEnd = (date: Date) => act(SET_SELECTING_END, date)

export type ShoppingListActions =
  | ReturnType<typeof setShoppingList>
  | ReturnType<typeof setShoppingListEmpty>
  | ReturnType<typeof setLoadingShoppingList>
  | ReturnType<typeof setShoppingListError>
  | ReturnType<typeof setSelectingStart>
  | ReturnType<typeof setSelectingEnd>

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
  action: ShoppingListActions
): IShoppingListState => {
  switch (action.type) {
    case SET_SHOPPING_LIST:
      return { ...state, shoppinglist: action.payload }
    case SET_LOADING_SHOPPING_LIST:
      return { ...state, loading: action.payload }
    case SET_SHOPPING_LIST_ERROR:
      return { ...state, error: action.payload }
    case SET_SELECTING_START:
      return { ...state, startDay: action.payload }
    case SET_SELECTING_END:
      return { ...state, endDay: action.payload }
    default:
      return state
  }
}

export default shoppinglist
