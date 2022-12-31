import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getRecipeList } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

export function useRecipeList() {
  const teamID = useTeamId()
  return useQuery(
    [teamID, "recipes-list"],
    () => getRecipeList().then(unwrapResult),
    {
      onSuccess: () => {
        // NOTE: we don't save all these recipes as it exceeds the localStorage
        // limit of 5MB (we try to save 3MB of data but that ends up being too
        // much for safari.)
      },
    },
  )
}
