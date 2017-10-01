import cart from './cart.js'

import {
  setCart,
  addToCart,
  removeFromCart,
  setCartItem,
} from '../actions.js'

describe('Cart', () => {
  it('Adds recipe to *empty* cart', () => {
    const beforeState = {}

    const afterState = {
      123: 1,
    }

    expect(
      cart(beforeState, addToCart(123))
    ).toEqual(afterState)
  })

  it('Adds recipe to cart', () => {
    const beforeState = {
      123: 2,
    }

    const afterState = {
      123: 2,
      456: 1,
    }

    expect(
      cart(beforeState, addToCart(456))
    ).toEqual(afterState)
  })

  it('Increases recipe count in cart', () => {
    const beforeState = {
      123: 2,
      1: 0,
    }

    const afterState = {
      123: 3,
      1: 0,
    }

    expect(
      cart(beforeState, addToCart(123))
    ).toEqual(afterState)
  })

  it('Remove recipe from *empty* cart', () => {
    const beforeState = {}

    expect(
      cart(beforeState, removeFromCart(123))
    ).toEqual({})
  })

  it('Remove recipe from cart', () => {
    const beforeState = {
      123: 1,
      456: 1,
    }
    const afterState = {
      456: 1,
      123: 0,
    }
    expect(
      cart(beforeState, removeFromCart(123))
    ).toEqual(afterState)
  })

  it('sets recipes in cart', () => {
    const beforeState = {}

    // this should match up to what the server is providing because we
    // normalize the server data in the reducer
    const cartItems = [
      {
        recipe: 1,
        count: 2,
      },
      {
        recipe: 2,
        count: 1,
      },
    ]

    const afterState = {
      1: 2,
      2: 1,
    }

    expect(
      cart(beforeState, setCart(cartItems)),
    ).toEqual(afterState)
  })

  it('sets an individual cart item', () => {
    const id = 1

    const beforeState = {
      [id]: 1,
      2: 1,
    }

    const count = 8

    const afterState = {
      [id]: count,
      2: 1,
    }

    expect(
      cart(beforeState, setCartItem(id, count)),
    ).toEqual(afterState)
  })
})
