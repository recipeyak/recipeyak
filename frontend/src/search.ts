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

function evalField(node: QueryNode, recipe: IRecipe): string | null {
  switch (node.field) {
    case "author": {
      const res = normalizedIncludes(recipe.author, node.value)
      if (res) {
        return recipe.author
      }
      return null
    }
    case "name": {
      const res = normalizedIncludes(recipe.name, node.value)
      if (res) {
        return recipe.name
      }
      return null
    }
    case "recipeId": {
      const res = normalizedIncludes(String(recipe.id), node.value)
      if (res) {
        return String(recipe.id)
      }
      return null
    }
    case "tag": {
      const matchingTag = recipe.tags?.find(tag => normalizedIncludes(tag, node.value))
      if (matchingTag != null) {
        return matchingTag
      }
      return null
    }
    case "ingredient": {
      const matchingIngredient = recipe.ingredients.find(ingredient =>
          normalizedIncludes(ingredient.name, node.value),
        )
      if (matchingIngredient != null) {
        return `${matchingIngredient.quantity} ${matchingIngredient.name}`
      }
      return null
    }
    case null: {
      const matchAuthor = evalField({ ...node, field: "author" }, recipe)
      const matchName = evalField({ ...node, field: "name" }, recipe)

      if (matchName) {
        return matchName
      }
      if (matchAuthor) {
        return matchAuthor
      }
      return null
    }
    default: {
      assertNever(node.field)
    }
  }
}

export function queryMatchesRecipe(query: QueryNode[], recipe: IRecipe): {match: boolean, fields: Match[]} {
  const matches: Match[] = []
  for (const node of query) {
    const match = evalField(node, recipe)
    if (node.negative) {
      if (match != null) {
        return {match: false, fields: []}
      }
    } else if (match == null) {
      return {match: false, fields: []}
    } else {
      matches.push({kind: node.field || "author", value: match})
    }
  }
  console.log({matches})
  return {match: true, fields: matches}
}

function evalQuery(query: QueryNode[], recipes: IRecipe[]) {
  return recipes.map(recipe => {
    return ({match: queryMatchesRecipe(query, recipe), recipe})
  }).filter(x => x.match.match)
}


export function searchRecipes(params: {
  readonly recipes: IRecipe[]
  readonly query: string
  readonly includeArchived?: boolean
}): {
  readonly recipes: { readonly recipe: IRecipe; readonly match: Match[] }[]
} {
  const query = parseQuery(params.query)
  const matchingRecipes = evalQuery(query, params.recipes)
    .map(x => ({ recipe: x.recipe, match: x.match.fields }))
    .sort((a, b) => sortArchivedName(a.recipe, b.recipe))
  return { recipes: matchingRecipes }
}
