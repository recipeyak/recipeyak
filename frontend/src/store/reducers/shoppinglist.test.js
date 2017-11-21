import shoppinglist from './shoppinglist.js'

import {
  setShoppingList,
  setLoadingShoppingList
} from '../actions.js'


describe('Shopping List', () => {
  const shopList = [
    {
        'name': 'tomato',
        'unit': '4.204622621848776 pound',
    },
    {
        'name': 'soy sauce',
        'unit': '2 tablespoon',
    }
  ]
  it('sets list', () => {
    const beforeState = {
      loading: true
    }
    // this should match up to what the server is providing because we
    // normalize the server data in the reducer

    const afterState = {
      loading: true,
      shoppinglist: shopList,
    }

    expect(
      shoppinglist(beforeState, setShoppingList(shopList))
    ).toEqual(afterState)
  })

  it('sets loading state', () => {
    const beforeState = {
      shoppinglist: shopList,
      loading: false
    }

    const afterState = {
      shoppinglist: shopList,
      loading: true,
    }

    expect(
      shoppinglist(beforeState, setLoadingShoppingList(true))
    ).toEqual(afterState)
  })
})
