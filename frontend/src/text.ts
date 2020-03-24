/**
 * Mixing up Tablespoon and teaspoon is harder when they are consistently cased
 */
export function capitalizeUnits(str: string): string {
  return str
    .replace(/tablespoon/g, "Tablespoon")
    .replace(/Teaspoon/g, "teaspoon")
}
