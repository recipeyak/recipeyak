import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { toISODateString } from "@/date"
import { http } from "@/http"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const getShoppingList = (start: Date | number, end: Date | number) => {
  return http.get<IGetShoppingListResponse>(`/api/v1/shoppinglist/`, {
    params: {
      start: toISODateString(start),
      end: toISODateString(end),
    },
  })
}

// eslint-disable-next-line no-restricted-syntax
export const enum Unit {
  POUND = "POUND",
  OUNCE = "OUNCE",
  GRAM = "GRAM",
  KILOGRAM = "KILOGRAM",
  TEASPOON = "TEASPOON",
  TABLESPOON = "TABLESPOON",
  FLUID_OUNCE = "FLUID_OUNCE",
  CUP = "CUP",
  PINT = "PINT",
  QUART = "QUART",
  GALLON = "GALLON",
  LITER = "LITER",
  MILLILITER = "MILLILITER",
  SOME = "SOME",
  UNKNOWN = "UNKNOWN",
  NONE = "NONE",
}

export interface IQuantity {
  readonly quantity: string
  readonly unit: Unit
  readonly unknown_unit?: string | null
}

export interface IIngredientItem {
  readonly category?: string
  readonly quantities: ReadonlyArray<IQuantity>
}

type GetShoppingListV2ResponseRecipe = {
  scheduledRecipeId: number
  recipeId: number
  recipeName: string
}

export interface IGetShoppingListResponse {
  readonly recipes: GetShoppingListV2ResponseRecipe[]
  readonly ingredients: {
    readonly [_: string]: IIngredientItem | undefined
  }
}

export function useShoppingListFetch({
  startDay,
  endDay,
}: {
  startDay: Date | number
  endDay: Date | number
}) {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "shopping-list", startDay, endDay],
    queryFn: () => getShoppingList(startDay, endDay).then(unwrapResult),
    placeholderData: keepPreviousData,
  })
}
