import cart from './cart'

import {
  setClearingCart
} from '../actions'

describe('Cart', () => {
  it('sets the cart to clearing', () => {
    const beforeState = {
      clearing: false
    }

    const afterState = {
      clearing: true
    }

    expect(
      cart(beforeState, setClearingCart(true))
    ).toEqual(afterState)
  })
})
