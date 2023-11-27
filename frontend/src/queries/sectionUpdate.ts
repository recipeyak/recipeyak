import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { http } from "@/http"
import { IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const updateSection = ({
  sectionId,
  position,
  title,
}: {
  readonly sectionId: number
  readonly position?: string
  readonly title?: string
}) =>
  http.patch<{ title: string; position: string; id: number }>(
    `/api/v1/sections/${sectionId}/`,
    { title, position },
  )
export function useSectionUpdate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      sectionId,
      update,
    }: {
      // recipe id so we can update cache
      recipeId: number
      sectionId: number
      update: {
        title?: string
        position?: string
      }
    }) =>
      updateSection({
        sectionId,
        position: update.position,
        title: update.title,
      }).then(unwrapResult),
    onSuccess: (res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.sections = recipe.sections.map((s) => {
              if (s.id === vars.sectionId) {
                return res
              }
              return s
            })
          })
        },
      )
    },
  })
}
