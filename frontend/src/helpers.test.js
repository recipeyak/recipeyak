import {deepCopy, getIngredients} from './helpers.js'

describe('HelperFunctions', () => {
it('Deep copy nested object', () => {
  const obj = {1: {2: {3: {4:[], 5: () => {console.log('hello')}}}}}
  expect(
    deepCopy(obj)
    ).toEqual(obj)
})
  it('Combine recipe ingredients into one array', () => {
    const recipes = [{ingredients: ['onion']}, {ingredients: ['tomato']}]
    const expected = ['onion', 'tomato']
    expect(
      getIngredients(recipes)
      ).toEqual(expected)
  })
})
