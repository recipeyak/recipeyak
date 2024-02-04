import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"

import { cookChecklistCreate } from "@/api/cookChecklistCreate"

type CookChecklist = Record<string, boolean>

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
    }) =>
      cookChecklistCreate({
        ingredient_id: ingredientId,
        checked,
        recipe_id: recipeId,
      }),
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
