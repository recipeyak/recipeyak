import cart from './cart.js'

it('Adds recipe to *empty* cart', () => {
  const beforeState = {}
  const afterState = {123: 1}
  expect(
    cart(beforeState, {type: 'ADD_TO_CART', id: 123})
    ).toEqual(afterState)
})

it('Adds recipe to cart', () => {
  const beforeState = {123: 2}
  const afterState = {
    123: 2,
    456: 1,
  }
  expect(
    cart(beforeState, {type: 'ADD_TO_CART', id: 456})
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
    cart(beforeState, {type: 'ADD_TO_CART', id: 123})
    ).toEqual(afterState)
})

it('Remove recipe from *empty* cart', () => {
  expect(
    cart({}, {type: 'REMOVE_FROM_CART', id: 123})
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
    cart(beforeState, {type: 'REMOVE_FROM_CART', id: 123})
    ).toEqual(afterState)
})
