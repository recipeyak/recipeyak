import { useQuery } from "@tanstack/react-query"

import { getShoppingList } from "@/api"
import { unwrapResult } from "@/query"

export function useShoppingListFetch({
  teamID,
  startDay,
  endDay,
}: {
  teamID: number | "personal"
  startDay: Date
  endDay: Date
}) {
  return useQuery(
    [teamID, "shopping-list", startDay, endDay],
    () => getShoppingList(teamID, startDay, endDay).then(unwrapResult),
    {
      keepPreviousData: true,
    },
  )
}
