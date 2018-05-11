import { calendar } from './calendar'

import {
  setCalendarRecipes,
  setCalendarRecipe,
  deleteCalendarRecipe,
  setCalendarError,
  setCalendarLoading,
} from '../actions'

describe('Calendar', () => {
  it('sets calendar recipes starting with empty state', () => {
    const beforeState = {
      allIds: [],
    }
    const afterState = {
      1: {
        id: 1,
        count: 3,
        on: '2018-05-11',
        recipe: 9,
      },
      2: {
        id: 2,
        count: 1,
        on: '2018-05-11',
        recipe: 3,
      },
      allIds: [1, 2],
    }

    const recipes = [{
      id: 1,
      count: 3,
      on: '2018-05-11',
      recipe: 9,
    }, {
      id: 2,
      count: 1,
      on: '2018-05-11',
      recipe: 3,
    }]

    expect(
      calendar(beforeState, setCalendarRecipes(recipes))
    ).toEqual(afterState)
  })

  it('sets calendar recipe starting with empty state', () => {
    const beforeState = {
      allIds: [],
    }

    const afterState = {
      1: {
        id: 1,
        count: 3,
        on: '2018-05-11',
        recipe: 9,
      },
      allIds: [1],
    }

    const recipes = {
      id: 1,
      count: 3,
      on: '2018-05-11',
      recipe: 9,
    }

    expect(
      calendar(beforeState, setCalendarRecipe(recipes))
    ).toEqual(afterState)
  })
  it('deletes calendar recipe', () => {
    const beforeState = {
      1: {
        id: 1,
        count: 3,
        on: '2018-05-11',
        recipe: 9,
      },
      allIds: [1],
    }

    const afterState = {
      allIds: [],
    }

    expect(
      calendar(beforeState, deleteCalendarRecipe(1))
    ).toEqual(afterState)
  })
  it('sets calendar loading', () => {
    const beforeState = {
      allIds: [],
    }

    const afterState = {
      loading: true,
      allIds: [],
    }

    expect(
      calendar(beforeState, setCalendarLoading(true))
    ).toEqual(afterState)
  })

  it('sets calendar error', () => {
    const beforeState = {
      allIds: [],
    }

    const afterState = {
      error: true,
      allIds: [],
    }

    expect(
      calendar(beforeState, setCalendarError(true))
    ).toEqual(afterState)
  })
})
