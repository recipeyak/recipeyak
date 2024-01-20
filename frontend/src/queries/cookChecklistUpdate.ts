import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

export type CookChecklist = Record<string, boolean>

export const updateChecklistItemCache = (
  params: {
    ingredientId: number
    checked: boolean
  },
  recipeId: number,
  queryClient: QueryClient,
) => {
  // eslint-disable-next-line no-restricted-syntax
  queryClient.setQueryData<CookChecklist>(
    ["updateCookChecklist", recipeId],
    (old) => ({ ...old, [params.ingredientId]: params.checked }),
  )
}

export function useCookChecklistUpdate({ recipeId }: { recipeId: number }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      ingredientId,
      checked,
    }: {
      ingredientId: number
      checked: boolean
    }) => {
      return updateCookChecklist({ checked, recipeId, ingredientId }).then(
        unwrapResult,
      )
    },
    onMutate(variables) {
      const previousData = queryClient.getQueryData([
        "updateCookChecklist",
        recipeId,
      ])
      updateChecklistItemCache(variables, recipeId, queryClient)
      return { previousData }
    },
    onError: (_err, _newData, context) => {
      // eslint-disable-next-line no-restricted-syntax
      queryClient.setQueryData(
        ["updateCookChecklist", recipeId],
        context?.previousData,
      )
    },
  })
}

export const updateCookChecklist = (params: {
  readonly recipeId: number
  readonly ingredientId: number
  readonly checked: boolean
}) => {
  return http.post<{
    readonly ingredient_id: number
    readonly checked: boolean
  }>(`/api/v1/cook-checklist/${params.recipeId}/`, {
    ingredient_id: params.ingredientId,
    checked: params.checked,
  })
}
