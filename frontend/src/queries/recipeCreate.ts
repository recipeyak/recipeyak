import { useMutation, useQueryClient } from "@tanstack/react-query"

import { recipeCreate } from "@/api/recipeCreate"
import { cacheUpsertRecipe } from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

export function useRecipeCreate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: (
      payload:
        | {
            from_url: string
          }
        | {
            name: string
          },
    ) => {
      const team = teamId
      const data =
        "from_url" in payload
          ? {
              team,
              from_url: payload.from_url,
            }
          : {
              team,
              name: payload.name,
            }
      return recipeCreate(data)
    },
    onSuccess: (res) => {
      cacheUpsertRecipe(queryClient, {
        teamId,
        recipeId: res.id,
        updater: () => {
          return res
        },
      })
    },
  })
}
