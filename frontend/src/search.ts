import { IRecipe } from "@/store/reducers/recipes"
import { parseIntOrNull } from "@/parseIntOrNull"
import nth from "lodash/nth"

// https://stackoverflow.com/a/37511463/3720597
const removeAccents = (x: string) =>
  x.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

const normalize = (x: string = "") =>
  removeAccents(x)
    .replace(/\W/g, "")
    .toLowerCase()

// get the actual query value from search_space:query_here
const normalizeQuery = (x: string) => {
  const z = x.split(":")
  return z.length > 0 ? normalize(z[1]) : normalize(x)
}

export function matchesQuery(recipe: IRecipe, query: string) {
  // basic search with ability to prepend a tag to query and only search for
  // things relevent to that tag

  const name = normalize(recipe.name)
  const author = normalize(recipe.author)

  if (query.indexOf("author:") === 0) {
    return author.includes(normalizeQuery(query))
  }

  if (query.indexOf("recipeId:") === 0) {
    const id = parseIntOrNull(nth(query.split(":"), 1))
    return recipe.id === id
  }

  if (query.indexOf("ingredient:") === 0) {
    return recipe.ingredients
      .map(x => normalize(x.name))
      .some(x => x.includes(normalizeQuery(query)))
  }

  if (query.indexOf("name:") === 0) {
    return name.includes(normalizeQuery(query))
  }

  query = normalize(query)

  query = ["author", "name", "ingredient"]
    .map(x => x + ":")
    .some(x => x.includes(query))
    ? ""
    : query

  return name.includes(query) || author.includes(query)
}
