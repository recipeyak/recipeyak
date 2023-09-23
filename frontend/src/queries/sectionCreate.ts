import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"

const addSectionToRecipe = ({
  recipeId,
  section,
  position,
}: {
  readonly recipeId: number
  readonly section: string
  readonly position: string
}) =>
  http.post<{ title: string; position: string; id: number }>(
    `/api/v1/recipes/${recipeId}/sections`,
    { title: section, position },
  )

export function useSectionCreate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      recipeId,
      payload,
    }: {
      recipeId: number
      payload: {
        title: string
        position: string
      }
    }) =>
      addSectionToRecipe({
        recipeId,
        section: payload.title,
        position: payload.position,
      }).then(unwrapResult),
    onSuccess: (res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.sections.push(res)
          })
        },
      )
    },
  })
}
