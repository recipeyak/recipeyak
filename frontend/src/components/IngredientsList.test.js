import { combineRecipeIngredients } from './IngredientsList'

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
