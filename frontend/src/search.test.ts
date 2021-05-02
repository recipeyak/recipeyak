import { getMatchType, matchesQuery, searchRecipes } from "@/search"
import { IRecipe } from "@/store/reducers/recipes"

function createRecipe(properties?: Partial<IRecipe>): IRecipe {
  return {
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
    ...properties,
  }
}

describe("search", () => {
  function searchRecipe(recipe: IRecipe, query: string) {
    return matchesQuery(recipe, query, getMatchType(query))
  }

  test("by recipeId:", () => {
    const recipe = createRecipe()
    const search = (query: string) => searchRecipe(recipe, query)
    expect(search("recipeid:150")).toEqual("no-match")
    expect(search("id:150")).toEqual("no-match")
    expect(search("recipeId:75")).toEqual("no-match")
    expect(search("recipeId:150")).toEqual({ kind: "recipeId", value: "150" })
  })
  // An empty query means we display all results
  test("empty queries", () => {
    const recipe = createRecipe()
    const search = (query: string) => searchRecipe(recipe, query)
    expect(search("recipeId:")).toEqual("empty-query")
    expect(search("")).toEqual("empty-query")
  })
  test("sort results alphabetically", () => {
    const resultNames = searchRecipes({
      recipes: [
        createRecipe({ id: 123, name: "Rhubarb Bars" }),
        createRecipe({ id: 456, name: "Apple Rhubarb Bars" }),
      ],
      query: "rhubarb",
    }).recipes.map(x => x.recipe.name)
    expect(resultNames).toEqual(["Apple Rhubarb Bars", "Rhubarb Bars"])
  })
})
