import addrecipe, { initialState } from './addrecipe'

import {
  setAddRecipeFormName,
  setAddRecipeFormAuthor,
  setAddRecipeFormSource,
  setAddRecipeFormTime,
  setAddRecipeFormServings,
  setAddRecipeFormTeam,
  addAddRecipeFormIngredient,
  removeAddRecipeFormIngredient,
  updateAddRecipeFormIngredient,
  addAddRecipeFormStep,
  removeAddRecipeFormStep,
  updateAddRecipeFormStep,
  clearAddRecipeForm
} from '../actions'

describe('addrecipe', () => {
  it('sets addrecipe form name', () => {
    const beforeState = {
      name: ''
    }

    const name = 'example name'

    const afterState = {
      name
    }

    expect(
      addrecipe(beforeState, setAddRecipeFormName(name))
    ).toEqual(afterState)
  })

  it('set add recipe form author', () => {
    const beforeState = {
      author: ''
    }

    const author = 'author'

    const afterState = {
      author
    }

    expect(
      addrecipe(beforeState, setAddRecipeFormAuthor(author))
    ).toEqual(afterState)
  })

  it('set add recipe form time', () => {
    const beforeState = {
      time: ''
    }

    const time = 'time'

    const afterState = {
      time
    }

    expect(
      addrecipe(beforeState, setAddRecipeFormTime(time))
    ).toEqual(afterState)
  })

  it('set add recipe form source', () => {
    const beforeState = {
      source: ''
    }

    const source = 'source'

    const afterState = {
      source
    }

    expect(
      addrecipe(beforeState, setAddRecipeFormSource(source))
    ).toEqual(afterState)
  })

  it('set add recipe form servings', () => {
    const beforeState = {
      servings: ''
    }

    const servings = 'servings'

    const afterState = {
      servings
    }

    expect(
      addrecipe(beforeState, setAddRecipeFormServings(servings))
    ).toEqual(afterState)
  })

  it('add add recipe form ingredient', () => {
    const beforeState = {
      ingredients: []
    }

    const ingredient = {
      quantity: '1 lbs',
      name: 'tomato',
      description: 'sliced'
    }

    const afterState = {
      ingredients: [
        ingredient
      ]
    }

    expect(
      addrecipe(beforeState, addAddRecipeFormIngredient(ingredient))
    ).toEqual(afterState)
  })

  it('remove add recipe form ingredient', () => {
    const ingredient = {
      quantity: '1 lbs',
      name: 'tomato',
      description: 'sliced'
    }

    const beforeState = {
      ingredients: [
        ingredient
      ]
    }

    const afterState = {
      ingredients: []
    }

    const index = 0

    expect(
      addrecipe(beforeState, removeAddRecipeFormIngredient(index))
    ).toEqual(afterState)
  })

  it('update add recipe form ingredient', () => {
    const ingredient = {
      quantity: '1 lbs',
      name: 'tomato',
      description: 'sliced'
    }

    const beforeState = {
      ingredients: [
        ingredient
      ]
    }

    const newIngredient = {
      quantity: '12 lbs',
      name: 'tomato',
      description: 'sliced'
    }

    const afterState = {
      ingredients: [
        newIngredient
      ]
    }

    const index = 0

    expect(
      addrecipe(beforeState, updateAddRecipeFormIngredient(index, newIngredient))
    ).toEqual(afterState)
  })

  it('add add recipe form step', () => {
    const beforeState = {
      steps: []
    }

    const step = {
      quantity: '1 lbs',
      name: 'tomato',
      description: 'sliced'
    }

    const afterState = {
      steps: [
        step
      ]
    }

    expect(
      addrecipe(beforeState, addAddRecipeFormStep(step))
    ).toEqual(afterState)
  })

  it('remove add recipe form step', () => {
    const step = {
      quantity: '1 lbs',
      name: 'tomato',
      description: 'sliced'
    }

    const beforeState = {
      steps: [
        step
      ]
    }

    const afterState = {
      steps: []
    }

    const index = 0

    expect(
      addrecipe(beforeState, removeAddRecipeFormStep(index))
    ).toEqual(afterState)
  })

  it('update add recipe form step', () => {
    const step = {
      quantity: '1 lbs',
      name: 'tomato',
      description: 'sliced'
    }

    const beforeState = {
      steps: [
        step
      ]
    }

    const newStep = {
      quantity: '12 lbs',
      name: 'tomato',
      description: 'sliced'
    }

    const afterState = {
      steps: [
        newStep
      ]
    }

    const index = 0

    expect(
      addrecipe(beforeState, updateAddRecipeFormStep(index, newStep))
    ).toEqual(afterState)
  })

  it('clears add recipe form', () => {
    const step = {
      quantity: '1 lbs',
      name: 'tomato',
      description: 'sliced'
    }

    const beforeState = {
      steps: [
        step
      ],
      name: 'tesitng'
    }

    const afterState = initialState

    expect(
      addrecipe(beforeState, clearAddRecipeForm())
    ).toEqual(afterState)
  })

  it("sets add recipe form's team field", () => {
    const beforeState = {
    }

    const team = 'cool team name'

    const afterState = {
      team
    }

    expect(
      addrecipe(beforeState, setAddRecipeFormTeam(team))
    ).toEqual(afterState)
  })
})
