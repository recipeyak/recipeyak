import shoppinglist, {
  IShoppingListState,
  IShoppingListItem
} from "@/store/reducers/shoppinglist"

import * as a from "@/store/reducers/shoppinglist"
import { Loading, Success, Failure, HttpErrorKind } from "@/webdata"

describe("Shopping List", () => {
  const shopList: IShoppingListItem[] = [
    {
      name: "tomato",
      unit: "4.204622621848776 pound"
    },
    {
      name: "soy sauce",
      unit: "2 tablespoon"
    }
  ]
  it("sets list", () => {
    const beforeState: IShoppingListState = {
      shoppinglist: Loading(),
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }
    // this should match up to what the server is providing because we
    // normalize the server data in the reducer

    const afterState: IShoppingListState = {
      shoppinglist: Success(shopList),
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    expect(
      shoppinglist(beforeState, a.fetchShoppingList.success(shopList))
    ).toEqual(afterState)
  })

  it("sets loading state", () => {
    const beforeState: IShoppingListState = {
      shoppinglist: undefined,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    const afterState: IShoppingListState = {
      shoppinglist: Loading(),
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    expect(shoppinglist(beforeState, a.fetchShoppingList.request())).toEqual(
      afterState
    )
  })

  it("sets the error correctly", () => {
    const beforeState: IShoppingListState = {
      shoppinglist: Loading(),
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    const afterState: IShoppingListState = {
      shoppinglist: Failure(HttpErrorKind.other),
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    expect(shoppinglist(beforeState, a.fetchShoppingList.failure())).toEqual(
      afterState
    )
  })

  it("set selecting start day", () => {
    const startDay = new Date(1776, 1, 1)

    const beforeState: IShoppingListState = {
      shoppinglist: undefined,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    const afterState: IShoppingListState = {
      shoppinglist: undefined,
      startDay,
      endDay: new Date(1776, 1, 2)
    }

    expect(shoppinglist(beforeState, a.setSelectingStart(startDay))).toEqual(
      afterState
    )
  })

  it("set selecting end day", () => {
    const endDay = new Date(1776, 1, 1)

    const beforeState: IShoppingListState = {
      shoppinglist: undefined,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    const afterState: IShoppingListState = {
      shoppinglist: undefined,
      startDay: new Date(1776, 1, 1),
      endDay
    }

    expect(shoppinglist(beforeState, a.setSelectingEnd(endDay))).toEqual(
      afterState
    )
  })
})
