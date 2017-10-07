import cart from './cart.js'

import {
  setCart,
  setCartItem
} from '../actions.js'

describe('Cart', () => {
  it('sets recipes in cart', () => {
    const beforeState = {}

    // this should match up to what the server is providing because we
    // normalize the server data in the reducer
    const cartItems = [
      {
        recipe: 1,
        count: 2
      },
      {
        recipe: 2,
        count: 1
      }
    ]

    const afterState = {
      1: 2,
      2: 1
    }

    expect(
      cart(beforeState, setCart(cartItems))
    ).toEqual(afterState)
  })

  it('sets an individual cart item', () => {
    const id = 1

    const beforeState = {
      [id]: 1,
      2: 1
    }

    const count = 8

    const afterState = {
      [id]: count,
      2: 1
    }

    expect(
      cart(beforeState, setCartItem(id, count))
    ).toEqual(afterState)
  })
})
