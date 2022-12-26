import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addWeeks, parseISO, startOfWeek, subWeeks } from "date-fns"

import { CalendarResponse, deleteScheduledRecipe, ICalRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

function deleteScheduledRecipeV2(params: {
  scheduledRecipeId: number
  teamId: number | "personal"
}): Promise<void> {
  return deleteScheduledRecipe(params.scheduledRecipeId, params.teamId).then(
    unwrapResult,
  )
}

export function useScheduledRecipeDelete() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteScheduledRecipeV2,
    onMutate: (vars) => {
      let deletedCalRecipe: ICalRecipe | undefined
      queryClient.setQueriesData([vars.teamId, "calendar"], (data: unknown) => {
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
      })
      return { deletedCalRecipe }
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
        queryClient.setQueryData(
          [teamID, "calendar", weekId.getTime()],
          (
            data: CalendarResponse | undefined,
          ): CalendarResponse | undefined => {
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
