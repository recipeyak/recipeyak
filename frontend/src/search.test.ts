import { queryMatchesRecipe } from "@/search"
import { IRecipe, IIngredient } from "@/store/reducers/recipes"

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

function createIngredient(properties?: Partial<IIngredient>): IIngredient {
  return {
    id: 50394,
    quantity: "1 pound",
    name: "tomatoes",
    description: "chopped",
    position: 0,
    optional: false,
    ...properties,
  }
}

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
  test("author negative non-matching", () => {
    const recipe = createRecipe({ author: "Mark Bittman" })
    expect(
      queryMatchesRecipe(
        [{ field: "author", value: "sam", negative: true }],
        recipe,
      ),
    ).toEqual(true)
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
  test("name negative non-matching", () => {
    const recipe = createRecipe({ name: "Crème brûlée" })
    expect(
      queryMatchesRecipe(
        [{ field: "name", value: "pizza", negative: true }],
        recipe,
      ),
    ).toEqual(true)
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
    const recipe = createRecipe({
      ingredients: [createIngredient({ name: "cream" })],
    })
    expect(
      queryMatchesRecipe([{ field: "ingredient", value: "cream" }], recipe),
    ).toEqual(true)
  })
  test("ingredient negative", () => {
    const recipe = createRecipe({
      ingredients: [createIngredient({ name: "cream" })],
    })
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
    const recipe = createRecipe({
      ingredients: [createIngredient({ name: "blah" })],
    })
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
