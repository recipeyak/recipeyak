export const byNameAlphabetical = (x, y) =>
  x.name != null && y.name != null
    ? x.name.toUpperCase().localeCompare(y.name.toUpperCase())
    : 0
