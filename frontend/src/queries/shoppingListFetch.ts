import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { toISODateString } from "@/date"
import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { unwrapResult } from "@/query"

const getShoppingList = (
  teamID: number | "personal",
  start: Date | number,
  end: Date | number,
) => {
  return http.get<IGetShoppingListResponse>(
    `/api/v1/t/${teamID}/shoppinglist/`,
    {
      params: {
        start: toISODateString(start),
        end: toISODateString(end),
        with_recipes: 1,
      },
    },
  )
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
    queryFn: () => getShoppingList(teamId, startDay, endDay).then(unwrapResult),
    placeholderData: keepPreviousData,
  })
}
