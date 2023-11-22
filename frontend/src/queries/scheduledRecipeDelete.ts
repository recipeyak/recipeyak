import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import { addWeeks, parseISO, startOfWeek, subWeeks } from "date-fns"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { CalendarResponse, ICalRecipe } from "@/queries/scheduledRecipeCreate"
import { unwrapResult } from "@/query"
// TODO(sbdchd): we shouldn't need teamID here
const deleteScheduledRecipe = (calId: ICalRecipe["id"], teamID: number) => {
  return http.delete(`/api/v1/t/${teamID}/calendar/${calId}/`)
}

function deleteScheduledRecipeV2(params: {
  scheduledRecipeId: number
  teamId: number
}): Promise<void> {
  return deleteScheduledRecipe(params.scheduledRecipeId, params.teamId).then(
    unwrapResult,
  )
}

export function onRecipeDeletion(
  queryClient: QueryClient,
  vars: { teamId: number; scheduledRecipeId: number },
) {
  let deletedCalRecipe: ICalRecipe | undefined
  queryClient.setQueriesData(
    { queryKey: [vars.teamId, "calendar"] },
    (data: unknown) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const oldData = data as CalendarResponse | undefined
      // TODO: we also need to be careful about shape of the data changing due to persistance
      if (oldData == null) {
        return oldData
      }
      const updatedScheduledRecipes: ICalRecipe[] = []
      oldData.scheduledRecipes.forEach((calRecipe) => {
        if (calRecipe.id !== vars.scheduledRecipeId) {
          updatedScheduledRecipes.push(calRecipe)
        } else {
          deletedCalRecipe = calRecipe
        }
      })
      return {
        ...oldData,
        scheduledRecipes: updatedScheduledRecipes,
      }
    },
  )
  return { deletedCalRecipe }
}

export function useScheduledRecipeDelete() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteScheduledRecipeV2,
    onMutate: (vars) => {
      return onRecipeDeletion(queryClient, vars)
    },
    onError: (_err, _vars, context) => {
      const deletedCalRecipe = context?.deletedCalRecipe
      if (deletedCalRecipe == null) {
        return
      }

      const initialWeekId = startOfWeek(parseISO(deletedCalRecipe.on))
      const weekIds = [
        subWeeks(initialWeekId, 2),
        subWeeks(initialWeekId, 1),
        initialWeekId,
        addWeeks(initialWeekId, 1),
        addWeeks(initialWeekId, 2),
      ]
      weekIds.forEach((weekId) => {
        queryClient.setQueryData<CalendarResponse>(
          [teamID, "calendar", weekId.getTime()],
          (data) => {
            if (data == null) {
              return data
            }
            const updatedScheduledRecipes: ICalRecipe[] = [
              ...data.scheduledRecipes,
              deletedCalRecipe,
            ]
            return { ...data, scheduledRecipes: updatedScheduledRecipes }
          },
        )
      })
    },
  })
}
