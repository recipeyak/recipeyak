import { addWeeks, startOfToday } from "date-fns"
import {
  ActionType,
  createAsyncAction,
  createStandardAction,
  getType,
} from "typesafe-actions"

import { IGetShoppingListResponse } from "@/api"
import { Failure, HttpErrorKind, Success, toLoading, WebData } from "@/webdata"

export const fetchShoppingList = createAsyncAction(
  "FETCH_SHOPPING_LIST_START",
  "FETCH_SHOPPING_LIST_SUCCESS",
  "FETCH_SHOPPING_LIST_FAILURE",
)<void, IGetShoppingListResponse, void>()

export const setSelectingStart = createStandardAction(
  "SET_SELECTING_START",
)<Date>()
export const setSelectingEnd = createStandardAction("SET_SELECTING_END")<Date>()

export type ShoppingListActions =
  | ReturnType<typeof setSelectingStart>
  | ReturnType<typeof setSelectingEnd>
  | ActionType<typeof fetchShoppingList>

export interface IShoppingListState {
  readonly shoppinglist: WebData<IGetShoppingListResponse>
  readonly startDay: Date
  readonly endDay: Date
}

const initialState: IShoppingListState = {
  shoppinglist: undefined,
  startDay: startOfToday(),
  endDay: addWeeks(startOfToday(), 1),
}

const shoppinglist = (
  state: IShoppingListState = initialState,
  action: ShoppingListActions,
): IShoppingListState => {
  switch (action.type) {
    case getType(fetchShoppingList.success):
      return { ...state, shoppinglist: Success(action.payload) }
    case getType(fetchShoppingList.request):
      return { ...state, shoppinglist: toLoading(state.shoppinglist) }
    case getType(fetchShoppingList.failure):
      return { ...state, shoppinglist: Failure(HttpErrorKind.other) }
    case getType(setSelectingStart):
      return { ...state, startDay: action.payload }
    case getType(setSelectingEnd):
      return { ...state, endDay: action.payload }
    default:
      return state
  }
}

export default shoppinglist
