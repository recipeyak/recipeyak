interface IName {
  readonly name: string
}

export const byNameAlphabetical = (x: IName, y: IName) =>
  x.name != null && y.name != null
    ? x.name.toUpperCase().localeCompare(y.name.toUpperCase())
    : 0

const normalize = (x: string) =>
  x
    .replace(/fresh|small|medium|large|ground/gi, "")
    .trim()
    .toUpperCase()

export function ingredientByNameAlphabetical(x: string, y: string) {
  return normalize(x).localeCompare(normalize(y))
}
