export const byNameAlphabetical = (x, y) =>
  x.name != null && y.name != null
    ? x.name.toUpperCase().localeCompare(y.name.toUpperCase())
    : 0;

export const ingredientByNameAlphabetical = (x, y) => {
  const normalize = x =>
    x
      .replace(/fresh|small|medium|large|ground/gi, "")
      .trim()
      .toUpperCase();

  if (x.name == null || y.name == null) {
    return 0;
  }

  return normalize(x.name).localeCompare(normalize(y.name));
};
