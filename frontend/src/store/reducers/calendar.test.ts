import {
  calendar,
  initialState,
  ICalendarState
} from "@/store/reducers/calendar"
import * as a from "@/store/reducers/calendar"
import { baseRecipe } from "@/store/reducers/recipes.test"

describe("Calendar", () => {
  it("sets calendar recipes starting with empty state", () => {
    const beforeState: ICalendarState = initialState

    const recipes = [
      {
        id: 1,
        count: 3,
        on: "2018-05-11",
        team: 2,
        user: 1,
        recipe: {
          ...baseRecipe,
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
          ...baseRecipe,
          id: 3
        }
      }
    ]

    const afterState: ICalendarState = {
      ...initialState,
      allIds: [recipes[0].id, recipes[1].id],
      byId: {
        [recipes[0].id]: recipes[0],
        [recipes[1].id]: recipes[1]
      }
    }

    expect(calendar(beforeState, a.setCalendarRecipes(recipes))).toEqual(
      afterState
    )
  })

  it("sets individual calendar recipe", () => {
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
        id: 9,
        name: "1231"
      }
    }

    const afterState: ICalendarState = {
      ...initialState,
      byId: {
        [recipe.id]: recipe
      },
      allIds: [recipe.id]
    }

    expect(calendar(beforeState, a.setCalendarRecipe(recipe))).toEqual(
      afterState
    )
  })
  it("deletes calendar recipe", () => {
    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        1: {
          id: 1,
          count: 3,
          on: "2018-05-11",
          team: 2,
          user: 1,
          recipe: {
            id: 9,
            name: "1231"
          }
        }
      },
      allIds: [1]
    }

    const afterState: ICalendarState = {
      ...initialState,
      allIds: []
    }

    expect(calendar(beforeState, a.deleteCalendarRecipe(1))).toEqual(afterState)
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

    expect(calendar(beforeState, a.setCalendarLoading(true))).toEqual(
      afterState
    )
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

    expect(calendar(beforeState, a.setCalendarError(true))).toEqual(afterState)
  })

  it("moves calendar recipe to new date", () => {
    const id = 1

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          count: 3,
          on: "2018-05-11",
          team: 2,
          user: 1,
          recipe: {
            id: 9,
            name: "1231"
          }
        }
      },
      allIds: [id]
    }

    const newOn = "2018-05-20"

    const afterState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          count: 3,
          on: newOn,
          team: 2,
          user: 1,
          recipe: {
            id: 9,
            name: "1231"
          }
        }
      },
      allIds: [id]
    }

    expect(calendar(beforeState, a.moveCalendarRecipe(id, newOn))).toEqual(
      afterState
    )
  })

  it("moves calendar recipe to new date and does not combine with existing recipe", () => {
    const id = 1000
    const newOn = "2018-05-20"

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          count: 3,
          on: "2018-05-11",
          team: 2,
          user: 1,
          recipe: {
            id: 9,
            name: "1231"
          }
        },
        2: {
          id: 2,
          count: 3,
          on: newOn,
          team: 2,
          user: 1,
          recipe: {
            id: 7,
            name: "1231"
          }
        },
        3: {
          id: 3,
          count: 1,
          on: "2018-06-07",
          team: 2,
          user: 1,
          recipe: {
            id: 9,
            name: "1231"
          }
        }
      },
      allIds: [id, 2, 3]
    }

    const afterState: ICalendarState = {
      ...initialState,
      allIds: [id, 2, 3],
      byId: {
        [id]: {
          id,
          count: 3,
          on: newOn,
          team: 2,
          user: 1,
          recipe: {
            id: 9,
            name: "1231"
          }
        },
        2: {
          id: 2,
          count: 3,
          on: newOn,
          team: 2,
          user: 1,
          recipe: {
            id: 7,
            name: "1231"
          }
        },
        3: {
          id: 3,
          count: 1,
          team: 2,
          user: 1,
          on: "2018-06-07",
          recipe: {
            id: 9,
            name: "1231"
          }
        }
      }
    }

    expect(calendar(beforeState, a.moveCalendarRecipe(id, newOn))).toEqual(
      afterState
    )
  })

  it("moves calendar recipe to new date & combines with existing recipe", () => {
    const id = 1
    const newOn = "2018-05-20"

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          count: 3,
          on: "2018-05-11",
          team: 2,
          user: 1,
          recipe: {
            ...baseRecipe,
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
            ...baseRecipe,
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
            ...baseRecipe,
            id: 9
          }
        }
      },
      allIds: [id, 2, 3]
    }

    const afterState: ICalendarState = {
      ...initialState,
      byId: {
        2: {
          id: 2,
          count: 6,
          on: newOn,
          team: 2,
          user: 1,
          recipe: {
            ...baseRecipe,
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
            ...baseRecipe,
            id: 9
          }
        }
      },
      allIds: [2, 3]
    }

    expect(calendar(beforeState, a.moveCalendarRecipe(id, newOn))).toEqual(
      afterState
    )
  })

  it("replaces existing recipe", () => {
    const id = 1000
    const newOn = "2018-05-20"

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          count: 3,
          on: "2018-05-11",
          team: 2,
          user: 1,
          recipe: {
            ...baseRecipe
          }
        },
        2: {
          id: 2,
          count: 3,
          on: newOn,
          team: 2,
          user: 1,
          recipe: {
            ...baseRecipe
          }
        },
        3: {
          id: 3,
          count: 1,
          team: 2,
          user: 1,
          on: "2018-06-07",
          recipe: {
            ...baseRecipe
          }
        }
      },
      allIds: [id, 2, 3]
    }

    const recipe: a.ICalRecipe = {
      id: 9,
      count: 1,
      on: "2018-07-21",
      team: 2,
      user: 1,

      recipe: { id: 19, name: "foo" }
    }

    const afterState: ICalendarState = {
      ...initialState,
      byId: {
        [recipe.id]: recipe,
        2: {
          id: 2,
          count: 3,
          on: newOn,
          team: 2,
          user: 1,
          recipe: {
            ...baseRecipe
          }
        },
        3: {
          id: 3,
          count: 1,
          team: 2,
          user: 1,
          on: "2018-06-07",
          recipe: {
            ...baseRecipe
          }
        }
      },
      allIds: [2, 3, recipe.id]
    }

    expect(calendar(beforeState, a.replaceCalendarRecipe(id, recipe))).toEqual(
      afterState
    )
  })

  it("combines with existing recipe", () => {
    const on = "2018-07-21"

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        2: {
          id: 2,
          count: 3,
          on,
          team: 2,
          user: 1,
          recipe: {
            ...baseRecipe,
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
            ...baseRecipe,
            id: 9
          }
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
      recipe: { ...baseRecipe, id: 9 }
    }

    const afterState: ICalendarState = {
      ...initialState,
      byId: {
        [recipe.id]: {
          id: recipe.id,
          count: 3 + recipe.count,
          on,
          team: 2,
          user: 1,
          recipe: {
            ...baseRecipe,
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
            ...baseRecipe,
            id: 9
          }
        }
      },
      allIds: [3, 9]
    }

    expect(calendar(beforeState, a.setCalendarRecipe(recipe))).toEqual(
      afterState
    )
  })
})
