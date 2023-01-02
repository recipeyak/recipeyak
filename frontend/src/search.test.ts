import { IIngredient, RecipeListItem } from "@/api"
import { queryMatchesRecipe } from "@/search"

function createRecipe(properties: {
  id?: number
  author?: RecipeListItem["author"]
  name?: RecipeListItem["name"]
  tags?: string[]
  ingredients?: {
    id: number
    quantity: string
    name: string
  }[]
}): RecipeListItem {
  return {
    id: 150,
    name: "",
    author: "",
    tags: [],
    archived_at: null,
    ingredients: [],
    primaryImage: null,
    ...properties,
  }
}

function createIngredient(properties?: Partial<IIngredient>): IIngredient {
  return {
    id: 50394,
    quantity: "1 pound",
    name: "tomatoes",
    description: "chopped",
    position: "0",
    optional: false,
    ...properties,
  }
}

describe("queryMatchesRecipe", () => {
  test("empty", () => {
    const recipe = createRecipe({ author: "Mark Bittman" })
    expect(queryMatchesRecipe([], recipe).match).toEqual(true)
  })
  test("author", () => {
    const recipe = createRecipe({ author: "Mark Bittman" })
    expect(
      queryMatchesRecipe([{ field: "author", value: "bittman" }], recipe).match,
    ).toEqual(true)
  })
  test("author negative", () => {
    const recipe = createRecipe({ author: "Mark Bittman" })
    expect(
      queryMatchesRecipe(
        [{ field: "author", value: "bittman", negative: true }],
        recipe,
      ).match,
    ).toEqual(false)
  })
  test("author negative non-matching", () => {
    const recipe = createRecipe({ author: "Mark Bittman" })
    expect(
      queryMatchesRecipe(
        [{ field: "author", value: "sam", negative: true }],
        recipe,
      ).match,
    ).toEqual(true)
  })
  test("name", () => {
    const recipe = createRecipe({ name: "Crème brûlée" })
    expect(
      queryMatchesRecipe([{ field: "name", value: "brulee" }], recipe).match,
    ).toEqual(true)
  })
  test("name negative", () => {
    const recipe = createRecipe({ name: "Crème brûlée" })
    expect(
      queryMatchesRecipe(
        [{ field: "name", value: "brulee", negative: true }],
        recipe,
      ).match,
    ).toEqual(false)
  })
  test("name negative non-matching", () => {
    const recipe = createRecipe({ name: "Crème brûlée" })
    expect(
      queryMatchesRecipe(
        [{ field: "name", value: "pizza", negative: true }],
        recipe,
      ).match,
    ).toEqual(true)
  })
  test("recipeId", () => {
    const recipe = createRecipe({ id: 5432 })
    expect(
      queryMatchesRecipe([{ field: "recipeId", value: "5432" }], recipe).match,
    ).toEqual(true)
  })
  test("recipeId negative", () => {
    const recipe = createRecipe({ id: 5432 })
    expect(
      queryMatchesRecipe(
        [{ field: "recipeId", value: "5432", negative: true }],
        recipe,
      ).match,
    ).toEqual(false)
  })
  test("ingredient", () => {
    const recipe = createRecipe({
      ingredients: [createIngredient({ name: "cream" })],
    })
    expect(
      queryMatchesRecipe([{ field: "ingredient", value: "cream" }], recipe)
        .match,
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
      ).match,
    ).toEqual(false)
  })
  test("tag", () => {
    const recipe = createRecipe({ tags: ["dessert"] })
    expect(
      queryMatchesRecipe([{ field: "tag", value: "dessert" }], recipe).match,
    ).toEqual(true)
  })
  test("tag negative", () => {
    const recipe = createRecipe({ tags: ["dessert"] })
    expect(
      queryMatchesRecipe(
        [{ field: "tag", value: "dessert", negative: true }],
        recipe,
      ).match,
    ).toEqual(false)
  })
  test("general — no match", () => {
    const recipe = createRecipe({
      author: "Mark Bittman",
      name: "Crème brûlée",
    })
    expect(
      queryMatchesRecipe([{ field: null, value: "chris" }], recipe).match,
    ).toEqual(false)
  })
  test("complex — match", () => {
    const recipe = createRecipe({
      author: "Mark Bittman",
      name: "Crème brûlée",
      tags: ["dessert"],
    })
    expect(
      queryMatchesRecipe(
        [
          { field: "author", value: "bittman" },
          { field: "name", value: "creme" },
          { field: "tag", value: "des" },
        ],
        recipe,
      ),
    ).toEqual({
      match: true,
      fields: [
        { kind: "author", value: "Mark Bittman" },
        { kind: "name", value: "Crème brûlée" },
        { kind: "tag", value: "dessert" },
      ],
    })
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
      ).match,
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
      ).match,
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
      ).match,
    ).toEqual(false)
  })
  test("ingredients missing tag", () => {
    const recipe = createRecipe({ ingredients: [] })
    expect(
      queryMatchesRecipe([{ field: "ingredient", value: "blah" }], recipe)
        .match,
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
      ).match,
    ).toEqual(false)
  })
  test("null field", () => {
    const recipe = createRecipe({
      author: "Mark Bittman",
      name: "Crème brûlée",
    })
    expect(
      queryMatchesRecipe([{ field: null, value: "bittman" }], recipe).match,
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
      ).match,
    ).toEqual(false)
  })
  test("regression test match name", () => {
    const recipe = createRecipe({
      author: "Amanda Hesser",
      name: "Thomas Keller's Butternut Squash Soup With Brown Butter",
      tags: ["chris"],
    })
    expect(
      queryMatchesRecipe(
        [
          { field: "tag", value: "chris" },
          { field: null, value: "bro" },
        ],
        recipe,
      ),
    ).toEqual({
      match: true,
      fields: [
        { kind: "tag", value: "chris" },
        {
          kind: "name",
          value: recipe.name,
        },
      ],
    })
  })
  test("match name and author", () => {
    const recipe = createRecipe({
      author: "Baker's Pie",
      name: "Bob Baker",
    })
    expect(
      queryMatchesRecipe([{ field: null, value: "baker" }], recipe),
    ).toEqual({
      match: true,
      fields: [
        {
          kind: "name",
          value: recipe.name,
        },
        {
          kind: "author",
          value: recipe.author,
        },
      ],
    })
  })
})
