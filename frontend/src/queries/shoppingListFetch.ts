import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { shoppinglistRetrieve } from "@/api/shoppinglistRetrieve"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { useTeamId } from "@/useTeamId"

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
