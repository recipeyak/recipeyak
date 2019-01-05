import addWeeks from "date-fns/add_weeks"
import startOfToday from "date-fns/start_of_today"

import {
  action as act,
  createAsyncAction,
  ActionType,
  getType
} from "typesafe-actions"
import {
  WebData,
  Success,
  Loading,
  Failure,
  HttpErrorKind,
  isSuccess,
  isRefetching,
  Refetching
} from "@/webdata"

const SET_SELECTING_START = "SET_SELECTING_START"
const SET_SELECTING_END = "SET_SELECTING_END"

export const fetchShoppingList = createAsyncAction(
  "FETCH_SHOPPING_LIST_START",
  "FETCH_SHOPPING_LIST_SUCCESS",
  "FETCH_SHOPPING_LIST_FAILURE"
)<void, IShoppingListItem[], void>()

export const setSelectingStart = (date: Date) => act(SET_SELECTING_START, date)

export const setSelectingEnd = (date: Date) => act(SET_SELECTING_END, date)

export type ShoppingListActions =
  | ReturnType<typeof setSelectingStart>
  | ReturnType<typeof setSelectingEnd>
  | ActionType<typeof fetchShoppingList>

export interface IShoppingListItem {
  readonly name: string
  readonly unit: string
}

export interface IShoppingListState {
  readonly shoppinglist: WebData<IShoppingListItem[]>
  readonly startDay: Date
  readonly endDay: Date
}

const initialState: IShoppingListState = {
  shoppinglist: undefined,
  startDay: startOfToday(),
  endDay: addWeeks(startOfToday(), 1)
}

const shoppinglist = (
  state: IShoppingListState = initialState,
  action: ShoppingListActions
): IShoppingListState => {
  switch (action.type) {
    case getType(fetchShoppingList.success):
      return { ...state, shoppinglist: Success(action.payload) }
    case getType(fetchShoppingList.request): {
      const nextState = isSuccess(state.shoppinglist)
        ? Refetching(state.shoppinglist.data)
        : Loading()
      return { ...state, shoppinglist: nextState }
    }
    case getType(fetchShoppingList.failure):
      return { ...state, shoppinglist: Failure(HttpErrorKind.other) }
    case SET_SELECTING_START:
      return { ...state, startDay: action.payload }
    case SET_SELECTING_END:
      return { ...state, endDay: action.payload }
    default:
      return state
  }
}

export default shoppinglist
