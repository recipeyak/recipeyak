import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"

const createRecipe = (
  recipe:
    | {
        readonly team: number | undefined
        readonly name: string
      }
    | { readonly team: number | undefined; readonly from_url: string },
) => http.post<IRecipe>("/api/v1/recipes/", recipe)

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
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const team = teamId as number
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
      return createRecipe(data).then(unwrapResult)
    },
    onSuccess: (res) => {
      queryClient.setQueryData<IRecipe>([teamId, "recipes", res.id], () => {
        return res
      })
    },
  })
}
