import {
  getMatchType,
  matchesQuery,
  searchRecipes,
  queryMatchesRecipe,
} from "@/search"
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

describe("queryMatchesRecipe", () => {
  test("empty", () => {
    const recipe = createRecipe({ author: "Mark Bittman" })
    expect(queryMatchesRecipe([], recipe)).toEqual(true)
  })
  test("author", () => {
    const recipe = createRecipe({ author: "Mark Bittman" })
    expect(
      queryMatchesRecipe([{ field: "author", value: "bittman" }], recipe),
    ).toEqual(true)
  })
  test("author negative", () => {
    const recipe = createRecipe({ author: "Mark Bittman" })
    expect(
      queryMatchesRecipe(
        [{ field: "author", value: "bittman", negative: true }],
        recipe,
      ),
    ).toEqual(false)
  })
  test("name", () => {
    const recipe = createRecipe({ name: "Crème brûlée" })
    expect(
      queryMatchesRecipe([{ field: "name", value: "brulee" }], recipe),
    ).toEqual(true)
  })
  test("name negative", () => {
    const recipe = createRecipe({ name: "Crème brûlée" })
    expect(
      queryMatchesRecipe(
        [{ field: "name", value: "brulee", negative: true }],
        recipe,
      ),
    ).toEqual(false)
  })
  test("recipeId", () => {
    const recipe = createRecipe({ id: 5432 })
    expect(
      queryMatchesRecipe([{ field: "recipeId", value: "5432" }], recipe),
    ).toEqual(true)
  })
  test("recipeId negative", () => {
    const recipe = createRecipe({ id: 5432 })
    expect(
      queryMatchesRecipe(
        [{ field: "recipeId", value: "5432", negative: true }],
        recipe,
      ),
    ).toEqual(false)
  })
  test("ingredient", () => {
    const recipe = createRecipe({ ingredients: ["cream"] })
    expect(
      queryMatchesRecipe([{ field: "ingredient", value: "cream" }], recipe),
    ).toEqual(true)
  })
  test("ingredient negative", () => {
    const recipe = createRecipe({ ingredients: ["cream"] })
    expect(
      queryMatchesRecipe(
        [{ field: "ingredient", value: "cream", negative: true }],
        recipe,
      ),
    ).toEqual(false)
  })
  test("tag", () => {
    const recipe = createRecipe({ tags: ["dessert"] })
    expect(
      queryMatchesRecipe([{ field: "tag", value: "dessert" }], recipe),
    ).toEqual(true)
  })
  test("tag negative", () => {
    const recipe = createRecipe({ tags: ["dessert"] })
    expect(
      queryMatchesRecipe(
        [{ field: "tag", value: "dessert", negative: true }],
        recipe,
      ),
    ).toEqual(false)
  })
  test("general — no match", () => {
    const recipe = createRecipe({
      author: "Mark Bittman",
      name: "Crème brûlée",
    })
    expect(
      queryMatchesRecipe([{ field: null, value: "chris" }], recipe),
    ).toEqual(false)
  })
  test("complex — no match", () => {
    const recipe = createRecipe({
      author: "Mark Bittman",
      name: "Crème brûlée",
    })
    expect(
      queryMatchesRecipe(
        [
          { field: "author", value: "bittman" },
          { field: "name", value: "creme" },
          { field: "tag", value: "blah" },
        ],
        recipe,
      ),
    ).toEqual(false)
  })
  test("complex, negative — match", () => {
    const recipe = createRecipe({
      author: "Mark Bittman",
      name: "Crème brûlée",
    })
    expect(
      queryMatchesRecipe(
        [
          { field: "author", value: "bittman" },
          { field: "name", value: "creme" },
          { field: "tag", value: "blah", negative: true },
        ],
        recipe,
      ),
    ).toEqual(true)
  })
  test("complex, negative — no match", () => {
    const recipe = createRecipe({
      author: "Mark Bittman",
      name: "Crème brûlée",
      tags: ["favs", "blah"],
    })
    expect(
      queryMatchesRecipe(
        [
          { field: "author", value: "bittman" },
          { field: "name", value: "creme" },
          { field: "tag", value: "blah", negative: true },
        ],
        recipe,
      ),
    ).toEqual(false)
  })
  test("ingredients missing tag", () => {
    const recipe = createRecipe({ ingredients: [] })
    expect(
      queryMatchesRecipe([{ field: "ingredient", value: "blah" }], recipe),
    ).toEqual(false)
  })
  test("ingredients negative, has tag", () => {
    const recipe = createRecipe({ ingredients: ["blah"] })
    expect(
      queryMatchesRecipe(
        [{ field: "ingredient", value: "blah", negative: true }],
        recipe,
      ),
    ).toEqual(false)
  })
  test("null field", () => {
    const recipe = createRecipe({
      author: "Mark Bittman",
      name: "Crème brûlée",
    })
    expect(
      queryMatchesRecipe([{ field: null, value: "bittman" }], recipe),
    ).toEqual(true)
  })
  test("null field with tag", () => {
    const recipe = createRecipe({
      author: "Mark Bittman",
      name: "Crème brûlée",
    })
    expect(
      queryMatchesRecipe(
        [
          { field: null, value: "bittman" },
          { field: "tag", value: "dessert" },
        ],
        recipe,
      ),
    ).toEqual(false)
  })
})
