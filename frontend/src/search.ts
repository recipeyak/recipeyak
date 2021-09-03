import { byNameAlphabetical, ingredientByNameAlphabetical } from "@/sorters"
import { IRecipe } from "@/store/reducers/recipes"
import { notUndefined } from "@/utils/general"
import flatMap from "lodash/flatMap"

// https://stackoverflow.com/a/37511463/3720597
const removeAccents = (x: string) =>
  x.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

const normalize = (x: string = "") =>
  removeAccents(x)
    .replace(/\W/g, "")
    .toLowerCase()

export type Match = {
  readonly kind: "author" | "recipeId" | "ingredient" | "name" | "tag"
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
  if (query.indexOf("tag:") === 0) {
    return ["tag"]
  }
  return ["name", "author"]
}

function normalizeQuery(query: string): string {
  return normalize(query.replace(/^(ingredient|name|author|recipeId|tag):/, ""))
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

  const normalizedQuery = normalizeQuery(query)
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
    if (field === "tag") {
      const matchingTag = recipe.tags?.find(tag =>
        normalize(tag).includes(normalizedQuery),
      )
      if (matchingTag != null) {
        return { kind: "tag", value: matchingTag }
      }
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

function groupCountSortByName(x: string[]): [string, number][] {
  const groups: Map<string, number> = new Map()
  x.forEach(item => {
    const currentValue = groups.get(item) || 0
    groups.set(item, currentValue + 1)
  })
  return Array.from(groups.entries())
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
    .sort((a, b) => sortArchivedName(a.recipe, b.recipe))
  const allTags = matchType.includes("tag")
    ? flatMap(params.recipes, x => x.tags || [])
    : []
  const normalizedQuery = normalizeQuery(params.query)
  const options = groupCountSortByName(allTags)
    .filter(x => {
      return !normalizedQuery || x[0].includes(normalizedQuery)
    })
    .map(x => ({ name: x[0], count: x[1] }))
    .sort((a, b) => ingredientByNameAlphabetical(a.name, b.name))

  return { matchOn: matchType, recipes: matchingRecipes, options }
}

function parseValue(x: string): { newPosition: number; value: string } {
  const terminator = x.startsWith(`"`) ? `"` : x.startsWith(`'`) ? `'` : null
  let value = ""

  if (terminator) {
    for (let i = 1; i < x.length; i++) {
      const chr = x[i]
      if (chr === terminator && x[i - 1] === "\\") {
        value = value.slice(0, value.length - 1)
        value += chr
      } else if (chr === terminator || chr === null) {
        return { value, newPosition: i + 1, quoted: true }
      } else {
        value += chr
      }
    }
  } else {
    for (let i = 0; i < x.length; i++) {
      const chr = x[i]
      if (chr === " " || chr === null) {
        return { value, newPosition: i }
      }
      value += chr
    }
  }
  return { value, newPosition: x.length }
}

type QueryNode = {
  field: "name" | "author" | "tag" | null
  value: string
  negative?: boolean
  quoted?: boolean
}

export function parseQuery(query: string): QueryNode[] {
  const parsed = []

  for (let i = 0; i < query.length; ) {
    let remainder = query.slice(i)

    if (remainder.startsWith("-tag:")) {
      i += "-tag:".length
      const { newPosition, value, quoted } = parseValue(query.slice(i))
      i += newPosition
      parsed.push({ field: "tag", value, negative: true })
    } else if (remainder.startsWith("-name:")) {
      i += "-name:".length
      const { newPosition, value, quoted } = parseValue(query.slice(i))
      i += newPosition
      parsed.push({ field: "name", value, negative: true })
    } else if (remainder.startsWith("-author:")) {
      i += "-author:".length
      const { newPosition, value, quoted } = parseValue(query.slice(i))
      i += newPosition
      parsed.push({ field: "author", value, negative: true })
    } else if (remainder.startsWith("tag:")) {
      i += "tag:".length
      const { newPosition, value, quoted } = parseValue(query.slice(i))
      i += newPosition
      parsed.push({ field: "tag", value, quoted })
    } else if (remainder.startsWith("author:")) {
      i += "author:".length
      const { newPosition, value, quoted } = parseValue(query.slice(i))
      i += newPosition
      parsed.push({ field: "author", value, quoted })
    } else if (remainder.startsWith("name:")) {
      i += "name:".length
      const { newPosition, value, quoted } = parseValue(query.slice(i))
      i += newPosition
      parsed.push({ field: "name", value, quoted })
    } else if (query[i] === "'" || query[i] === '"') {
      const { newPosition, value, quoted } = parseValue(query.slice(i))
      i += newPosition
      parsed.push({ field: null, value, quoted })
    } else if (query[i] === " ") {
      i += 1
    } else {
      const { newPosition, value, quoted } = parseValue(query.slice(i))
      i += newPosition
      parsed.push({ field: null, value, quoted })
    }
  }
  return parsed.filter(x => x.value)
}
