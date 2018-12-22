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

export const ingredientByNameAlphabetical = (x: IName, y: IName) => {
  if (x.name == null || y.name == null) {
    return 0
  }

  return normalize(x.name).localeCompare(normalize(y.name))
}
