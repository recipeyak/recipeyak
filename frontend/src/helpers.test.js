import { deepCopy, getIngredients, combineRecipeIngredients, flatten } from './helpers.js'

describe('DeepCopy()', () => {
  it('Deep copy nested object', () => {
    const obj = { 1: { 2: { 3: { 4: [], 5: () => { console.log('hello') } } } } }
    expect(
      deepCopy(obj)
      ).toEqual(obj)
  })
})

describe('flatten()', () => {
  it('flattens two deep nested array', () => {
    const actual = flatten([ ['xyz', 'abc'], ['hmm', 'tribe', ['quest']] ])
    const expected = [ 'xyz', 'abc', 'hmm', 'tribe' , 'quest']
    expect(actual).toEqual(expected)
  })
})

describe('RecursiveFlatten()', () => {
  it('Combine recipe ingredients into one array', () => {
    const recipes = [{ ingredients: ['onion'] }, { ingredients: ['tomato'] }]
    const expected = ['onion', 'tomato']
    expect(
      getIngredients(recipes)
      ).toEqual(expected)
  })
})

describe('CombineRecipeIngredients()', () => {
  it('Takes in [] of recipe Objects and returns array of recipe objects', () => {
    const recipes = [
      {
        inCart: 1,
        ingredients: [
          '¼ cup lemon juice',
          'abc',
        ],
      },
      {
        inCart: 2,
        ingredients: [
          'xyz',
          'red',
          'abc',
        ],
      },
    ]

    const actual = combineRecipeIngredients(recipes)
    const expected = [
      { ingredient: 'abc', occurs: 3 },
      { ingredient: 'red', occurs: 2 },
      { ingredient: 'xyz', occurs: 2 },
      { ingredient: '¼ cup lemon juice', occurs: 1 },
    ]
    expect(actual).toEqual(expected)
  })
})
