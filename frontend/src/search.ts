import { IRecipe } from "@/store/reducers/recipes"
import { notUndefined } from "@/utils/general"

// https://stackoverflow.com/a/37511463/3720597
const removeAccents = (x: string) =>
  x.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

const normalize = (x: string = "") =>
  removeAccents(x)
    .replace(/\W/g, "")
    .toLowerCase()

export type Match = {
  readonly kind: "author" | "recipeId" | "ingredient" | "name"
  readonly value: string
}

export function getMatchType(rawQuery: string): Match["kind"][] {
  const query = rawQuery.trim()
  if (query.indexOf("author:") === 0) {
    return ["author"]
  }
  if (query.indexOf("recipeId:") === 0) {
    return ["recipeId"]
  }
  if (query.indexOf("ingredient:") === 0) {
    return ["ingredient"]
  }
  if (query.indexOf("name:") === 0) {
    return ["name"]
  }
  return ["name", "author"]
}

export function matchesQuery(
  recipe: IRecipe,
  query: string,
  matchType: Match["kind"][],
): Match | "no-match" | "empty-query" {
  // basic search with ability to prepend a tag to query and only search for
  // things relevent to that tag
  const name = normalize(recipe.name)
  const author = normalize(recipe.author)
  const recipeId = String(recipe.id)

  const normalizedQuery = normalize(
    query.replace(/^(ingredient|name|author|recipeId):/, ""),
  )
  if (!normalizedQuery) {
    return "empty-query"
  }
  for (const field of matchType) {
    if (field === "name" && name.includes(normalizedQuery)) {
      return { kind: "name", value: name }
    }
    if (field === "author" && author.includes(normalizedQuery)) {
      return { kind: "author", value: author }
    }
    if (field === "recipeId" && recipeId.includes(normalizedQuery)) {
      return { kind: "recipeId", value: recipeId }
    }
    if (field === "ingredient") {
      for (const ingredient of recipe.ingredients) {
        const normalizedIngredientName = normalize(ingredient.name)
        if (normalizedIngredientName.includes(normalizedQuery)) {
          return {
            kind: "ingredient",
            value: `${ingredient.quantity} ${ingredient.name}`,
          }
        }
      }
    }
  }
  return "no-match"
}

export function searchRecipes(params: {
  readonly recipes: IRecipe[]
  readonly query: string
  readonly includeArchived?: boolean
}): {
  readonly matchOn: Match["kind"][]
  readonly recipes: { readonly recipe: IRecipe; readonly match: Match | null }[]
} {
  const matchType = getMatchType(params.query)
  const matchingRecipes = params.recipes
    .map(recipe => {
      const match = matchesQuery(recipe, params.query, matchType) ?? undefined
      if (typeof match === "string") {
        if (match === "no-match") {
          return undefined
        }
        return { recipe, match: null }
      }
      return { recipe, match }
    })
    .filter(notUndefined)

  return { matchOn: matchType, recipes: matchingRecipes }
}
