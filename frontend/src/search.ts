import { byNameAlphabetical } from "@/sorters"
import { IRecipe } from "@/store/reducers/recipes"
import { parseQuery, QueryNode } from "@/query-parser"

// https://stackoverflow.com/a/37511463/3720597
const removeAccents = (x: string) =>
  x.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

const normalize = (x: string = "") =>
  removeAccents(x)
    .replace(/\W/g, "")
    .toLowerCase()

function normalizedIncludes(a: string, b: string): boolean {
  return normalize(a).includes(normalize(b))
}

export type Match = {
  readonly kind: "author" | "recipeId" | "ingredient" | "name" | "tag"
  readonly value: string
}

/** Sort archived recipes last, then sort alphabetically */
function sortArchivedName(a: IRecipe, b: IRecipe) {
  if (a.archived_at && !b.archived_at) {
    return 1
  }
  if (!a.archived_at && b.archived_at) {
    return -1
  }
  return byNameAlphabetical(a, b)
}

function assertNever(x: never): never {
  return x
}

function evalField(node: QueryNode, recipe: IRecipe): boolean {
  switch (node.field) {
    case "author": {
      return normalizedIncludes(recipe.author, node.value)
    }
    case "name": {
      return normalizedIncludes(recipe.name, node.value)
    }
    case "recipeId": {
      return normalizedIncludes(String(recipe.id), node.value)
    }
    case "tag": {
      return (
        recipe.tags?.find(tag => normalizedIncludes(tag, node.value)) !==
        undefined
      )
    }
    case "ingredient": {
      return (
        recipe.ingredients.find(ingredient =>
          normalizedIncludes(ingredient.name, node.value),
        ) !== undefined
      )
    }
    case null: {
      const matchAuthor = evalField({ ...node, field: "author" }, recipe)
      const matchName = evalField({ ...node, field: "name" }, recipe)

      return matchAuthor || matchName
    }
    default: {
      assertNever(node.field)
    }
  }
}

export function queryMatchesRecipe(query: QueryNode[], recipe: IRecipe) {
  for (const node of query) {
    const match = evalField(node, recipe)
    if (node.negative) {
      if (match) {
        return false
      }
    } else if (!match) {
      return false
    }
  }
  return true
}

function evalQuery(query: QueryNode[], recipes: IRecipe[]) {
  return recipes.filter(recipe => queryMatchesRecipe(query, recipe))
}

export function searchRecipes(params: {
  readonly recipes: IRecipe[]
  readonly query: string
  readonly includeArchived?: boolean
}): {
  readonly recipes: { readonly recipe: IRecipe; readonly match: Match | null }[]
  readonly options: { name: string; count: number }[]
} {
  const query = parseQuery(params.query)
  const matchingRecipes = evalQuery(query, params.recipes)
    .map(recipe => ({ recipe, match: null }))
    .sort((a, b) => sortArchivedName(a.recipe, b.recipe))
  return { recipes: matchingRecipes, options: [] }
}
