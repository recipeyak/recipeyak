import { matchesQuery } from "@/search"
import { IRecipe } from "@/store/reducers/recipes"

describe("search", () => {
  test("by recipeId:", () => {
    const recipe: IRecipe = {
      id: 150,
      name: "",
      author: "",
      source: "",
      time: "",
      servings: "",
      steps: [],
      modified: "",
      last_scheduled: "",
      edits: [],
      team: 10,
      owner: { type: "user", id: 5 },
      ingredients: [],
      sections: [],
      notes: [],
      created: ""
    }

    const testCases = [
      ["recipeid:150", false],
      ["id:150", false],
      ["recipeId:75", false],
      ["recipeId:", false],
      ["recipeId:150", true]
    ] as const

    testCases.forEach(([query, expected]) => {
      expect(matchesQuery(recipe, query)).toEqual(expected)
    })
  })
})
