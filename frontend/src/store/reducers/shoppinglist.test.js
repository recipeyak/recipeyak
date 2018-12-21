import shoppinglist from "./shoppinglist.js"

import {
  setShoppingList,
  setLoadingShoppingList,
  setShoppingListEmpty,
  setShoppingListError,
  setSelectingStart,
  setSelectingEnd
} from "../actions"

describe("Shopping List", () => {
  const shopList = [
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
    const beforeState = {
      loading: true
    }
    // this should match up to what the server is providing because we
    // normalize the server data in the reducer

    const afterState = {
      loading: true,
      shoppinglist: shopList
    }

    expect(shoppinglist(beforeState, setShoppingList(shopList))).toEqual(
      afterState
    )
  })

  it("sets loading state", () => {
    const beforeState = {
      shoppinglist: shopList,
      loading: false
    }

    const afterState = {
      shoppinglist: shopList,
      loading: true
    }

    expect(shoppinglist(beforeState, setLoadingShoppingList(true))).toEqual(
      afterState
    )
  })

  it("empties the shopping list", () => {
    const beforeState = {
      shoppinglist: shopList
    }

    const afterState = {
      shoppinglist: []
    }

    expect(shoppinglist(beforeState, setShoppingListEmpty())).toEqual(
      afterState
    )
  })

  it("sets the error correctly", () => {
    const beforeState = {
      error: false
    }

    const afterState = {
      error: true
    }

    expect(shoppinglist(beforeState, setShoppingListError(true))).toEqual(
      afterState
    )
  })

  it("set selecting start day", () => {
    const beforeState = {}

    const startDay = new Date(1776, 1, 1)

    const afterState = {
      startDay
    }

    expect(shoppinglist(beforeState, setSelectingStart(startDay))).toEqual(
      afterState
    )
  })

  it("set selecting end day", () => {
    const beforeState = {}

    const endDay = new Date(1776, 1, 1)

    const afterState = {
      endDay
    }

    expect(shoppinglist(beforeState, setSelectingEnd(endDay))).toEqual(
      afterState
    )
  })
})
