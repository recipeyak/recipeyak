import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { shoppinglistRetrieve } from "@/api/shoppinglistRetrieve"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { useTeamId } from "@/useTeamId"

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

export type IQuantity = IIngredientItem["quantities"][number]

export type IIngredientItem = IGetShoppingListResponse["ingredients"][number]

export type IGetShoppingListResponse = ResponseFromUse<
  typeof useShoppingListFetch
>

export function useShoppingListFetch({
  startDay,
  endDay,
}: {
  startDay: Date
  endDay: Date
}) {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "shopping-list", startDay, endDay],
    queryFn: () =>
      shoppinglistRetrieve({
        start: startDay,
        end: endDay,
      }),
    placeholderData: keepPreviousData,
  })
}
