import shoppinglist, {
  IShoppingListState,
  IShoppingListItem
} from "@/store/reducers/shoppinglist"

import * as a from "@/store/reducers/shoppinglist"

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
      loading: true,
      shoppinglist: [],
      error: false,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }
    // this should match up to what the server is providing because we
    // normalize the server data in the reducer

    const afterState: IShoppingListState = {
      loading: true,
      shoppinglist: shopList,
      error: false,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    expect(shoppinglist(beforeState, a.setShoppingList(shopList))).toEqual(
      afterState
    )
  })

  it("sets loading state", () => {
    const beforeState: IShoppingListState = {
      loading: false,
      shoppinglist: shopList,
      error: false,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    const afterState: IShoppingListState = {
      loading: true,
      shoppinglist: shopList,
      error: false,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    expect(shoppinglist(beforeState, a.setLoadingShoppingList(true))).toEqual(
      afterState
    )
  })

  it("empties the shopping list", () => {
    const beforeState: IShoppingListState = {
      loading: false,
      shoppinglist: shopList,
      error: false,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    const afterState: IShoppingListState = {
      loading: false,
      shoppinglist: [],
      error: false,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    expect(shoppinglist(beforeState, a.setShoppingListEmpty())).toEqual(
      afterState
    )
  })

  it("sets the error correctly", () => {
    const beforeState: IShoppingListState = {
      loading: false,
      shoppinglist: [],
      error: false,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    const afterState: IShoppingListState = {
      loading: false,
      shoppinglist: [],
      error: true,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    expect(shoppinglist(beforeState, a.setShoppingListError(true))).toEqual(
      afterState
    )
  })

  it("set selecting start day", () => {
    const startDay = new Date(1776, 1, 1)

    const beforeState: IShoppingListState = {
      loading: false,
      shoppinglist: [],
      error: false,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    const afterState: IShoppingListState = {
      loading: false,
      shoppinglist: [],
      error: false,
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
      loading: false,
      shoppinglist: [],
      error: false,
      startDay: new Date(1776, 1, 1),
      endDay: new Date(1776, 1, 2)
    }

    const afterState: IShoppingListState = {
      loading: false,
      shoppinglist: [],
      error: false,
      startDay: new Date(1776, 1, 1),
      endDay
    }

    expect(shoppinglist(beforeState, a.setSelectingEnd(endDay))).toEqual(
      afterState
    )
  })
})
