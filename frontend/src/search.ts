import ASCIIFolder from "fold-to-ascii"

import { assertNever } from "@/assert"
import { RecipeListItem } from "@/queries/recipeList"
import { parseQuery, QueryNode } from "@/query-parser"
import { byNameAlphabetical } from "@/sorters"

// https://stackoverflow.com/a/37511463/3720597
const removeAccents = (x: string) =>
  x.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

const normalize = (x: string = "") =>
  ASCIIFolder.foldMaintaining(removeAccents(x)).replace(/\W/g, "").toLowerCase()

function normalizedIncludes(a: string, b: string): boolean {
  return normalize(a).includes(normalize(b))
}

export type Match = {
  readonly kind: "author" | "recipeId" | "ingredient" | "name" | "tag"
  readonly value: string
}

/** Sort archived recipes last, then sort alphabetically */
function sortArchivedName(
  a: RecipeListItem,
  b: RecipeListItem,
  query: QueryNode[],
) {
  if (a.archived_at && !b.archived_at) {
    return 1
  }
  if (!a.archived_at && b.archived_at) {
    return -1
  }

  if (query.length === 0) {
    // sort A-Z if no query is provided.
    return byNameAlphabetical(a, b)
  }
  return b.scheduledCount - a.scheduledCount
}

function evalField(node: QueryNode, recipe: RecipeListItem): Match[] | null {
  switch (node.field) {
    case "author": {
      const res = normalizedIncludes(recipe.author ?? "", node.value)
      if (res) {
        return [{ kind: "author", value: recipe.author ?? "" }]
      }
      return null
    }
    case "name": {
      const res = normalizedIncludes(recipe.name, node.value)
      if (res) {
        return [{ kind: "name", value: recipe.name }]
      }
      return null
    }
    case "recipeId": {
      const res = normalizedIncludes(String(recipe.id), node.value)
      if (res) {
        return [{ kind: "recipeId", value: String(recipe.id) }]
      }
      return null
    }
    case "tag": {
      const matchingTag = recipe.tags?.find((tag) =>
        normalizedIncludes(tag, node.value),
      )
      if (matchingTag != null) {
        return [{ kind: "tag", value: matchingTag }]
      }
      return null
    }
    case "ingredient": {
      const matchingIngredient = recipe.ingredients.find((ingredient) =>
        normalizedIncludes(ingredient.name, node.value),
      )
      if (matchingIngredient != null) {
        return [
          {
            kind: "ingredient",
            value: `${matchingIngredient.quantity} ${matchingIngredient.name}`,
          },
        ]
      }
      return null
    }
    case null: {
      const matchAuthor = evalField({ ...node, field: "author" }, recipe)
      const matchName = evalField({ ...node, field: "name" }, recipe)
      if (matchName == null && matchAuthor == null) {
        return null
      }

      return (matchName || []).concat(matchAuthor || [])
    }
    default: {
      assertNever(node.field)
    }
  }
}

export function queryMatchesRecipe(
  query: QueryNode[],
  recipe: RecipeListItem,
): { match: boolean; fields: Match[] } {
  let allMatches: Match[] = []
  for (const node of query) {
    const matches = evalField(node, recipe)
    if (node.negative) {
      if (matches != null) {
        return { match: false, fields: [] }
      }
    } else if (matches == null) {
      return { match: false, fields: [] }
    } else {
      allMatches = [...allMatches, ...matches]
    }
  }
  return { match: true, fields: allMatches }
}

function evalQuery(query: QueryNode[], recipes: RecipeListItem[]) {
  return recipes
    .map((recipe) => {
      return { match: queryMatchesRecipe(query, recipe), recipe }
    })
    .filter((x) => x.match.match)
}

export function searchRecipes(params: {
  readonly recipes: RecipeListItem[]
  readonly query: string
  readonly includeArchived?: boolean
}): {
  readonly recipes: {
    readonly recipe: RecipeListItem
    readonly match: Match[]
  }[]
} {
  const query = parseQuery(params.query)
  const matchingRecipes = evalQuery(query, params.recipes).map((x) => ({
    recipe: x.recipe,
    match: x.match.fields,
  }))

  const rankedRecipes = matchingRecipes.sort((a, b) =>
    sortArchivedName(a.recipe, b.recipe, query),
  )
  return { recipes: rankedRecipes }
}
