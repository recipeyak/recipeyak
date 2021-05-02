import { getMatchType, matchesQuery } from "@/search"
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
      created: "",
      archived_at: null,
    }

    function search(query: string) {
      return matchesQuery(recipe, query, getMatchType(query))
    }

    expect(search("recipeid:150")).toEqual("no-match")
    expect(search("id:150")).toEqual("no-match")
    expect(search("recipeId:75")).toEqual("no-match")
    expect(search("recipeId:")).toEqual("empty-query")
    expect(search("")).toEqual("empty-query")
    expect(search("recipeId:150")).toEqual({ kind: "recipeId", value: "150" })
  })
})
