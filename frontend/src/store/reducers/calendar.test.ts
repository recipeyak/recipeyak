import {
  calendar,
  initialState,
  ICalendarState,
  ICalRecipe,
  fetchCalendarRecipes,
  setCalendarRecipe,
  deleteCalendarRecipe,
  moveCalendarRecipe,
  replaceCalendarRecipe,
  getExistingRecipe
} from "@/store/reducers/calendar"
import { baseRecipe } from "@/store/reducers/recipes.test"
import { getModel } from "redux-loop"
import { addWeeks, isSameDay, isAfter, subWeeks, startOfWeek } from "date-fns"
import parseISO from "date-fns/parseISO"
import { toISODateString } from "@/date"
import { Success } from "@/webdata"

describe("Calendar", () => {
  it("sets calendar recipes starting with empty state", () => {
    const beforeState: ICalendarState = initialState

    const recipes: ICalRecipe[] = [
      {
        id: 1,
        created: "2019-02-01T05:00:00.000Z",
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
        created: "2019-02-01T05:00:00.000Z",
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
      status: "success",
      byId: {
        [recipes[0].id]: recipes[0],
        [recipes[1].id]: recipes[1]
      },
      settings: Success({
        syncEnabled: false,
        calendarLink: ""
      })
    }

    const start = "2019-02-01T00:00:00.000Z"
    const end = "2019-02-04T00:00:00.000Z"

    expect(
      calendar(
        beforeState,
        fetchCalendarRecipes.success({
          scheduledRecipes: recipes,
          start,
          end,
          settings: {
            syncEnabled: false,
            calendarLink: ""
          }
        })
      )
    ).toEqual(afterState)
  })

  it("sets individual calendar recipe", () => {
    const beforeState: ICalendarState = {
      ...initialState
    }

    const recipe: ICalRecipe = {
      id: 1,
      created: "2019-02-01T05:00:00.000Z",
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
      }
    }

    expect(calendar(beforeState, setCalendarRecipe(recipe))).toEqual(afterState)
  })
  it("deletes calendar recipe", () => {
    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        1: {
          id: 1,
          created: "2019-02-01T05:00:00.000Z",
          count: 3,
          on: "2018-05-11",
          team: 2,
          user: 1,
          recipe: {
            id: 9,
            name: "1231"
          }
        }
      }
    }

    const afterState: ICalendarState = {
      ...initialState
    }

    expect(calendar(beforeState, deleteCalendarRecipe(1))).toEqual(afterState)
  })
  it("sets calendar loading", () => {
    const beforeState: ICalendarState = {
      ...initialState
    }

    const afterState: ICalendarState = {
      ...initialState,
      status: "loading"
    }

    expect(calendar(beforeState, fetchCalendarRecipes.request())).toEqual(
      afterState
    )
  })

  it("sets calendar error", () => {
    const beforeState: ICalendarState = {
      ...initialState
    }

    const afterState: ICalendarState = {
      ...initialState,
      status: "failure"
    }

    expect(calendar(beforeState, fetchCalendarRecipes.failure())).toEqual(
      afterState
    )
  })

  it("moves calendar recipe to new date", () => {
    const id = 1

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          created: "2019-02-01T05:00:00.000Z",
          count: 3,
          on: "2018-05-11",
          team: 2,
          user: 1,
          recipe: {
            id: 9,
            name: "1231"
          }
        }
      }
    }

    const newOn = "2018-05-20"

    const afterState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          created: "2019-02-01T05:00:00.000Z",
          count: 3,
          on: newOn,
          team: 2,
          user: 1,
          recipe: {
            id: 9,
            name: "1231"
          }
        }
      }
    }

    expect(
      calendar(beforeState, moveCalendarRecipe({ id, to: newOn }))
    ).toEqual(afterState)
  })

  it("moves calendar recipe to new date and does not combine with existing recipe", () => {
    const id = 1000
    const newOn = "2018-05-20"

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
          count: 1,
          on: "2018-06-07",
          team: 2,
          user: 1,
          recipe: {
            id: 9,
            name: "1231"
          }
        }
      }
    }

    const afterState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
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

    expect(
      calendar(beforeState, moveCalendarRecipe({ id, to: newOn }))
    ).toEqual(afterState)
  })

  it("moves calendar recipe to new date & combines with existing recipe", () => {
    const id = 1
    const newOn = "2018-05-20"

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
          count: 1,
          team: 2,
          user: 1,
          on: "2018-06-07",
          recipe: {
            ...baseRecipe,
            id: 9
          }
        }
      }
    }

    const afterState: ICalendarState = {
      ...initialState,
      byId: {
        2: {
          id: 2,
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
          count: 1,
          team: 2,
          user: 1,
          on: "2018-06-07",
          recipe: {
            ...baseRecipe,
            id: 9
          }
        }
      }
    }

    expect(
      calendar(beforeState, moveCalendarRecipe({ id, to: newOn }))
    ).toEqual(afterState)
  })

  it("replaces existing recipe", () => {
    const id = 1000
    const newOn = "2018-05-20"

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        [id]: {
          id,
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
          count: 1,
          team: 2,
          user: 1,
          on: "2018-06-07",
          recipe: {
            ...baseRecipe
          }
        }
      }
    }

    const recipe: ICalRecipe = {
      id: 9,
      created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
          count: 1,
          team: 2,
          user: 1,
          on: "2018-06-07",
          recipe: {
            ...baseRecipe
          }
        }
      }
    }

    expect(
      calendar(beforeState, replaceCalendarRecipe({ id, recipe }))
    ).toEqual(afterState)
  })

  it("combines with existing recipe", () => {
    const on = "2018-07-21"

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        2: {
          id: 2,
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
          count: 1,
          team: 2,
          user: 1,
          on: "2018-06-07",
          recipe: {
            ...baseRecipe,
            id: 9
          }
        }
      }
    }

    const recipe: ICalRecipe = {
      id: 9,
      created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
          count: 1,
          team: 2,
          user: 1,
          on: "2018-06-07",
          recipe: {
            ...baseRecipe,
            id: 9
          }
        }
      }
    }

    expect(calendar(beforeState, setCalendarRecipe(recipe))).toEqual(afterState)
  })

  test("refetching clears the existing data in the range", () => {
    const on = "2018-06-07"

    const recipe4 = {
      id: 4,
      created: "2019-02-01T05:00:00.000Z",
      count: 1,
      team: 2,
      user: 1,
      on: "2018-07-07",
      recipe: {
        ...baseRecipe,
        id: 9
      }
    }

    const beforeState: ICalendarState = {
      ...initialState,
      byId: {
        2: {
          id: 2,
          created: "2019-02-01T05:00:00.000Z",
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
          created: "2019-02-01T05:00:00.000Z",
          count: 1,
          team: 2,
          user: 1,
          on: "2018-06-07",
          recipe: {
            ...baseRecipe,
            id: 9
          }
        },
        4: recipe4
      }
    }

    const start = toISODateString(startOfWeek(subWeeks(parseISO(on), 1)))
    const end = toISODateString(startOfWeek(addWeeks(parseISO(on), 1)))
    const nextState = getModel(
      calendar(
        beforeState,
        fetchCalendarRecipes.success({
          scheduledRecipes: [],
          start,
          end,
          settings: {
            syncEnabled: false,
            calendarLink: ""
          }
        })
      )
    )

    expect(nextState.byId).toEqual({ 4: recipe4 })
  })
})

describe("calendar selectors", () => {
  test("#getExistingRecipe", () => {
    // initialize state
    const emptyState = getModel(
      calendar(undefined, fetchCalendarRecipes.failure())
    )

    const teamID = 5
    const userID = 1
    const recipeID = 10

    const fromDate = new Date()
    const from: ICalRecipe = {
      id: 1,
      created: "2019-02-01T05:00:00.000Z",
      count: 1,
      on: String(fromDate),
      team: teamID,
      user: userID,
      recipe: {
        id: recipeID,
        name: "foo recipe"
      }
    }
    const toDate = addWeeks(fromDate, 1)

    expect(isAfter(toDate, fromDate)).toEqual(true)

    // smoke test. There aren't any other recipes in the reducer so we should
    // get undefined.
    expect(
      getExistingRecipe({
        state: emptyState,
        on: toDate,
        from
      })
    ).toEqual(undefined)

    // existing recipe scheduled at the toDate
    const calRecipeOnSameDay: ICalRecipe = {
      id: 2,
      created: "2019-02-01T05:00:00.000Z",
      count: 1,
      on: String(toDate),
      team: teamID,
      user: userID,
      recipe: {
        id: recipeID,
        name: "foo recipe"
      }
    }
    expect(calRecipeOnSameDay.id).not.toEqual(from.id)
    expect(isSameDay(new Date(calRecipeOnSameDay.on), toDate)).toEqual(true)

    const start = calRecipeOnSameDay.on
    const end = calRecipeOnSameDay.on

    const nextState = getModel(
      calendar(
        emptyState,
        fetchCalendarRecipes.success({
          scheduledRecipes: [calRecipeOnSameDay],
          settings: {
            syncEnabled: false,
            calendarLink: ""
          },
          start,
          end
        })
      )
    )

    expect(
      getExistingRecipe({
        state: nextState,
        on: toDate,
        from
      })
    ).not.toBeUndefined()

    // moving recipe from its location and back to its location in one
    // drag-and-drop go.
    const calRecipe = getExistingRecipe({
      state: nextState,
      on: toDate,
      from: calRecipeOnSameDay
    })
    expect(calRecipe).toBeUndefined()
  })
})
