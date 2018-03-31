import {
  Recipe,
} from './store/reducers/recipes'

export const byNameAlphabetical = (x: Recipe, y: Recipe) =>
  x.name != null && y.name != null
    ? x.name.toUpperCase().localeCompare(y.name.toUpperCase())
    : 0

type NameObj = { name: string }
export const ingredientByNameAlphabetical = (x: NameObj, y: NameObj) => {
  const normalize = (x: string) => x.replace(/fresh|small|medium|large|ground/ig, '').trim().toUpperCase()

  if (x.name == null || y.name == null) {
    return 0
  }

  return normalize(x.name).localeCompare(normalize(y.name))
}
