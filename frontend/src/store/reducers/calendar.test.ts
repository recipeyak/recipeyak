import { calendar, initialState, ICalendarState } from "./calendar"

import {
  setCalendarRecipes,
  setCalendarRecipe,
  deleteCalendarRecipe,
  setCalendarError,
  setCalendarLoading,
  moveCalendarRecipe,
  replaceCalendarRecipe
} from "../actions"

describe("Calendar", () => {
  it("sets calendar recipes starting with empty state", () => {
    const beforeState: ICalendarState = {
      ...initialState,
      allIds: []
    }
    const afterState: ICalendarState = {
      ...initialState,
      1: {
        id: 1,
        count: 3,
        on: "2018-05-11",
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      2: {
        id: 2,
        count: 1,
        on: "2018-05-11",
        team: 2,
        user: 1,
        recipe: {
          id: 3
        }
      },
      allIds: [1, 2]
    }

    const recipes = [
      {
        id: 1,
        count: 3,
        on: "2018-05-11",
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      {
        id: 2,
        count: 1,
        on: "2018-05-11",
        team: 2,
        user: 1,
        recipe: {
          id: 3
        }
      }
    ]

    expect(calendar(beforeState, setCalendarRecipes(recipes))).toEqual(
      afterState
    )
  })

  it("sets calendar recipe starting with empty state", () => {
    const beforeState: ICalendarState = {
      ...initialState,
      allIds: []
    }

    const recipe = {
      id: 1,
      count: 3,
      on: "2018-05-11",
      team: 2,
      user: 1,
      recipe: {
        id: 9
      }
    }

    const afterState: ICalendarState = {
      ...initialState,
      [recipe.id]: recipe,
      allIds: [1]
    }

    expect(calendar(beforeState, setCalendarRecipe(recipe))).toEqual(afterState)
  })
  it("deletes calendar recipe", () => {
    const beforeState: ICalendarState = {
      ...initialState,
      1: {
        id: 1,
        count: 3,
        on: "2018-05-11",
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      allIds: [1]
    }

    const afterState: ICalendarState = {
      ...initialState,
      allIds: []
    }

    expect(calendar(beforeState, deleteCalendarRecipe(1))).toEqual(afterState)
  })
  it("sets calendar loading", () => {
    const beforeState: ICalendarState = {
      ...initialState,
      allIds: []
    }

    const afterState: ICalendarState = {
      ...initialState,
      loading: true,
      allIds: []
    }

    expect(calendar(beforeState, setCalendarLoading(true))).toEqual(afterState)
  })

  it("sets calendar error", () => {
    const beforeState: ICalendarState = {
      ...initialState,
      allIds: []
    }

    const afterState: ICalendarState = {
      ...initialState,
      error: true,
      allIds: []
    }

    expect(calendar(beforeState, setCalendarError(true))).toEqual(afterState)
  })

  it("moves calendar recipe to new date", () => {
    const id = 1

    const beforeState: ICalendarState = {
      ...initialState,
      [id]: {
        id,
        count: 3,
        on: "2018-05-11",
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      allIds: [id]
    }

    const newOn = "2018-05-20"

    const afterState: ICalendarState = {
      ...initialState,
      [id]: {
        id,
        count: 3,
        on: newOn,
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      allIds: [id]
    }

    expect(calendar(beforeState, moveCalendarRecipe(id, newOn))).toEqual(
      afterState
    )
  })

  it("moves calendar recipe to new date and does not combine with existing recipe", () => {
    const id = 1
    const newOn = "2018-05-20"

    const beforeState: ICalendarState = {
      ...initialState,
      [id]: {
        id,
        count: 3,
        on: "2018-05-11",
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      2: {
        id: 2,
        count: 3,
        on: newOn,
        team: 2,
        user: 1,
        recipe: {
          id: 7
        }
      },
      3: {
        id: 3,
        count: 1,
        on: "2018-06-07",
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      allIds: [id, 2, 3]
    }

    const afterState: ICalendarState = {
      ...initialState,
      [id]: {
        id,
        count: 3,
        on: newOn,
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      2: {
        id: 2,
        count: 3,
        on: newOn,
        team: 2,
        user: 1,
        recipe: {
          id: 7
        }
      },
      3: {
        id: 3,
        count: 1,
        team: 2,
        user: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [id, 2, 3]
    }

    expect(calendar(beforeState, moveCalendarRecipe(id, newOn))).toEqual(
      afterState
    )
  })

  it("moves calendar recipe to new date & combines with existing recipe", () => {
    const id = 1
    const newOn = "2018-05-20"

    const beforeState: ICalendarState = {
      ...initialState,
      [id]: {
        id,
        count: 3,
        on: "2018-05-11",
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      2: {
        id: 2,
        count: 3,
        team: 2,
        user: 1,
        on: newOn,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        team: 2,
        user: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [id, 2, 3]
    }

    const afterState: ICalendarState = {
      ...initialState,
      2: {
        id: 2,
        count: 6,
        on: newOn,
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        team: 2,
        user: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [2, 3]
    }

    expect(calendar(beforeState, moveCalendarRecipe(id, newOn))).toEqual(
      afterState
    )
  })

  it("replaces existing recipe", () => {
    const id = 1000
    const newOn = "2018-05-20"

    const beforeState: ICalendarState = {
      ...initialState,
      [id]: {
        id,
        count: 3,
        on: "2018-05-11",
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      2: {
        id: 2,
        count: 3,
        on: newOn,
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        team: 2,
        user: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [id, 2, 3]
    }

    const recipe = {
      id: 9,
      count: 1,
      on: "2018-07-21",
      team: 2,
      user: 1,

      recipe: { id: 19 }
    }

    const afterState: ICalendarState = {
      ...initialState,
      [recipe.id]: recipe,
      2: {
        id: 2,
        count: 3,
        on: newOn,
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        team: 2,
        user: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [2, 3, recipe.id]
    }

    expect(calendar(beforeState, replaceCalendarRecipe(id, recipe))).toEqual(
      afterState
    )
  })

  it("combines with existing recipe", () => {
    const on = "2018-07-21"

    const beforeState: ICalendarState = {
      ...initialState,
      2: {
        id: 2,
        count: 3,
        on,
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        team: 2,
        user: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [2, 3]
    }

    const recipe = {
      id: 9,
      count: 1,
      on,
      team: 2,
      user: 1,
      recipe: { id: 9 }
    }

    const afterState: ICalendarState = {
      ...initialState,
      [recipe.id]: {
        id: recipe.id,
        count: 3 + recipe.count,
        on,
        team: 2,
        user: 1,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        team: 2,
        user: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [3, 9]
    }

    expect(calendar(beforeState, setCalendarRecipe(recipe))).toEqual(afterState)
  })
})
