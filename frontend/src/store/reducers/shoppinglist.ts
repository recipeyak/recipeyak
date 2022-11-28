import { addWeeks, startOfToday } from "date-fns"
import { ActionType, createStandardAction, getType } from "typesafe-actions"

export const setSelectingStart = createStandardAction(
  "SET_SELECTING_START",
)<Date>()
export const setSelectingEnd = createStandardAction("SET_SELECTING_END")<Date>()
export const setShopping = createStandardAction("SET_SHOPPING")<boolean>()

export type ShoppingListActions =
  | ReturnType<typeof setSelectingStart>
  | ReturnType<typeof setSelectingEnd>
  | ActionType<typeof setShopping>

export interface IShoppingListState {
  readonly startDay: Date
  readonly endDay: Date
  readonly isShopping: boolean
}

const initialState: IShoppingListState = {
  startDay: startOfToday(),
  endDay: addWeeks(startOfToday(), 1),
  isShopping: false,
}

const shoppinglist = (
  state: IShoppingListState = initialState,
  action: ShoppingListActions,
): IShoppingListState => {
  switch (action.type) {
    case getType(setSelectingStart):
      return { ...state, startDay: action.payload }
    case getType(setSelectingEnd):
      return { ...state, endDay: action.payload }
    case getType(setShopping):
      return { ...state, isShopping: action.payload }
    default:
      return state
  }
}

export default shoppinglist
