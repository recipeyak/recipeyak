import { calendar } from "./calendar";

import {
  setCalendarRecipes,
  setCalendarRecipe,
  deleteCalendarRecipe,
  setCalendarError,
  setCalendarLoading,
  moveCalendarRecipe,
  replaceCalendarRecipe
} from "../actions";

describe("Calendar", () => {
  it("sets calendar recipes starting with empty state", () => {
    const beforeState = {
      allIds: []
    };
    const afterState = {
      1: {
        id: 1,
        count: 3,
        on: "2018-05-11",
        recipe: 9
      },
      2: {
        id: 2,
        count: 1,
        on: "2018-05-11",
        recipe: 3
      },
      allIds: [1, 2]
    };

    const recipes = [
      {
        id: 1,
        count: 3,
        on: "2018-05-11",
        recipe: 9
      },
      {
        id: 2,
        count: 1,
        on: "2018-05-11",
        recipe: 3
      }
    ];

    expect(calendar(beforeState, setCalendarRecipes(recipes))).toEqual(
      afterState
    );
  });

  it("sets calendar recipe starting with empty state", () => {
    const beforeState = {
      allIds: []
    };

    const afterState = {
      1: {
        id: 1,
        count: 3,
        on: "2018-05-11",
        recipe: 9
      },
      allIds: [1]
    };

    const recipes = {
      id: 1,
      count: 3,
      on: "2018-05-11",
      recipe: 9
    };

    expect(calendar(beforeState, setCalendarRecipe(recipes))).toEqual(
      afterState
    );
  });
  it("deletes calendar recipe", () => {
    const beforeState = {
      1: {
        id: 1,
        count: 3,
        on: "2018-05-11",
        recipe: 9
      },
      allIds: [1]
    };

    const afterState = {
      allIds: []
    };

    expect(calendar(beforeState, deleteCalendarRecipe(1))).toEqual(afterState);
  });
  it("sets calendar loading", () => {
    const beforeState = {
      allIds: []
    };

    const afterState = {
      loading: true,
      allIds: []
    };

    expect(calendar(beforeState, setCalendarLoading(true))).toEqual(afterState);
  });

  it("sets calendar error", () => {
    const beforeState = {
      allIds: []
    };

    const afterState = {
      error: true,
      allIds: []
    };

    expect(calendar(beforeState, setCalendarError(true))).toEqual(afterState);
  });

  it("moves calendar recipe to new date", () => {
    const id = 1;

    const beforeState = {
      [id]: {
        id,
        count: 3,
        on: "2018-05-11",
        recipe: {
          id: 9
        }
      },
      allIds: [id]
    };

    const newOn = "2018-05-20";

    const afterState = {
      [id]: {
        id,
        count: 3,
        on: newOn,
        recipe: {
          id: 9
        }
      },
      allIds: [id]
    };

    expect(calendar(beforeState, moveCalendarRecipe(id, newOn))).toEqual(
      afterState
    );
  });

  it("moves calendar recipe to new date and does not combine with existing recipe", () => {
    const id = 1;
    const newOn = "2018-05-20";

    const beforeState = {
      [id]: {
        id,
        count: 3,
        on: "2018-05-11",
        recipe: {
          id: 9
        }
      },
      2: {
        id: 2,
        count: 3,
        on: newOn,
        recipe: {
          id: 7
        }
      },
      3: {
        id: 3,
        count: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [id, 2, 3]
    };

    const afterState = {
      [id]: {
        id,
        count: 3,
        on: newOn,
        recipe: {
          id: 9
        }
      },
      2: {
        id: 2,
        count: 3,
        on: newOn,
        recipe: {
          id: 7
        }
      },
      3: {
        id: 3,
        count: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [id, 2, 3]
    };

    expect(calendar(beforeState, moveCalendarRecipe(id, newOn))).toEqual(
      afterState
    );
  });

  it("moves calendar recipe to new date & combines with existing recipe", () => {
    const id = 1;
    const newOn = "2018-05-20";

    const beforeState = {
      [id]: {
        id,
        count: 3,
        on: "2018-05-11",
        recipe: {
          id: 9
        }
      },
      2: {
        id: 2,
        count: 3,
        on: newOn,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [id, 2, 3]
    };

    const afterState = {
      2: {
        id: 2,
        count: 6,
        on: newOn,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [2, 3]
    };

    expect(calendar(beforeState, moveCalendarRecipe(id, newOn))).toEqual(
      afterState
    );
  });

  it("replaces existing recipe", () => {
    const id = 1000;
    const newOn = "2018-05-20";

    const beforeState = {
      [id]: {
        id,
        count: 3,
        on: "2018-05-11",
        recipe: {
          id: 9
        }
      },
      2: {
        id: 2,
        count: 3,
        on: newOn,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [id, 2, 3]
    };

    const recipe = {
      id: 9,
      count: 1,
      on: "2018-07-21",
      recipe: { id: 19 }
    };

    const afterState = {
      [recipe.id]: recipe,
      2: {
        id: 2,
        count: 3,
        on: newOn,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [2, 3, recipe.id]
    };

    expect(calendar(beforeState, replaceCalendarRecipe(id, recipe))).toEqual(
      afterState
    );
  });

  it("combines with existing recipe", () => {
    const on = "2018-07-21";

    const beforeState = {
      2: {
        id: 2,
        count: 3,
        on,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [2, 3]
    };

    const recipe = {
      id: 9,
      count: 1,
      on,
      recipe: { id: 9 }
    };

    const afterState = {
      [recipe.id]: {
        id: recipe.id,
        count: 3 + recipe.count,
        on,
        recipe: {
          id: 9
        }
      },
      3: {
        id: 3,
        count: 1,
        on: "2018-06-07",
        recipe: {
          id: 9
        }
      },
      allIds: [3, 9]
    };

    expect(calendar(beforeState, setCalendarRecipe(recipe))).toEqual(
      afterState
    );
  });
});
