import cart from './cart.js'

import {
  setCart,
  addToCart,
  removeFromCart,
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
      cart(beforeState, {
        type: 'REMOVE_FROM_CART',
        id: 123,
      })
    ).toEqual(afterState)
  })

  it('sets recipes in cart', () => {
    const beforeState = {}

    const cartItems = [
      {
        id: 1,
        count: 2,
      },
      {
        id: 2,
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
})
