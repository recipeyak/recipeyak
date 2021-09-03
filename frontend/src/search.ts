import { byNameAlphabetical, ingredientByNameAlphabetical } from "@/sorters"
import { IRecipe } from "@/store/reducers/recipes"
import { notUndefined } from "@/utils/general"
import { parseQuery, QueryNode } from "@/query-parser"
import flatMap from "lodash/flatMap"

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



function normalizeQuery(query: string): string {
  return normalize(query.replace(/^(ingredient|name|author|recipeId|tag):/, ""))
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



type MatchReason = {
  matched: boolean
  matchOn: {
    field: QueryNode["field"]
    value: string
  }[]
}

export function queryMatchesRecipe(query: QueryNode[], recipe: IRecipe) {
  let match = true
  for (const node of query) {
    switch (node.field) {
      case "author": {
        const matches = normalizedIncludes(recipe.author, node.value)
        if ((matches && node.negative) || !matches) {
          return false
        }
        break
      }
      case "name": {
        const matches = normalizedIncludes(recipe.name, node.value)
        if ((matches && node.negative) || !matches) {
          return false
        }
        break
      }
      case "recipeId": {
        const matches = normalizedIncludes(String(recipe.id), node.value)
        if ((matches && node.negative) || !matches) {
          return false
        }
        break
      }
      case "tag": {
        const matches = recipe.tags?.find(tag =>
          normalizedIncludes(tag, node.value),
        )
        if (node.negative) {
          if (matches) {
            return false
          }
        } else if (!matches) {
            return false
          }
        break
      }
      case "ingredient": {
        const matches = recipe.ingredients.find(ingredient =>
          normalizedIncludes(ingredient, node.value),
        )
        if ((matches && node.negative) || !matches) {
          return false
        }
        break
      }
      case null: {
        const matchesName = normalizedIncludes(recipe.name, node.value)
        const matchesAuthor = normalizedIncludes(recipe.author, node.value)
        if (!(matchesName || matchesAuthor)) {
          return false
        }
        break
      }
    }
  }
  return match
}

function evalQuery(query: QueryNode[], recipes: IRecipe[]) {
  return recipes.filter(recipe => queryMatchesRecipe(query, recipe))
}

export function searchRecipes(params: {
  readonly recipes: IRecipe[]
  readonly query: string
  readonly includeArchived?: boolean
}): {
  readonly matchOn: Match["kind"][]
  readonly recipes: { readonly recipe: IRecipe; readonly match: Match | null }[]
  readonly options: { name: string; count: number }[]
} {
  const query = parseQuery(params.query)
  const matchingRecipes = evalQuery(query, params.recipes)
    .map(recipe => ({ recipe, match: null }))
    .sort((a, b) => sortArchivedName(a.recipe, b.recipe))
  return { matchOn: [], recipes: matchingRecipes, options: [] }
}
