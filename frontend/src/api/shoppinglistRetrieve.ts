// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function shoppinglistRetrieve(params: { start: string; end: string }) {
  return http<{
    ingredients: Record<
      string,
      {
        quantities: Array<{
          quantity: string
          unit:
            | "POUND"
            | "OUNCE"
            | "GRAM"
            | "KILOGRAM"
            | "TEASPOON"
            | "TABLESPOON"
            | "FLUID_OUNCE"
            | "CUP"
            | "PINT"
            | "QUART"
            | "GALLON"
            | "LITER"
            | "MILLILITER"
            | "SOME"
            | "NONE"
            | "UNKNOWN"
          unknown_unit: string | null
        }>
        category: string | null
      }
    >
    recipes: Array<{
      scheduledRecipeId: number
      recipeId: number
      recipeName: string
    }>
  }>({
    url: "/api/v1/shoppinglist/",
    method: "get",
    params,
  })
}
