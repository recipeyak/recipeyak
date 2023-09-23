import { useQuery } from "@tanstack/react-query"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"

type ITimelineEvent = ICommentEvent | IScheduledRecipeEvent

interface ICommentEvent {
  readonly id: number
  readonly type: "comment"
  readonly author: string
}
interface IScheduledRecipeEvent {
  readonly id: number
  readonly type: "scheduled"
  readonly date: string
}

function toTimelineEvent(event: IRecipeTimelineEvent): ITimelineEvent {
  return {
    type: "scheduled",
    id: event.id,
    date: event.on,
  }
}

export interface IRecipeTimelineEvent {
  readonly id: number
  readonly on: string
}

const getRecipeTimeline = (id: IRecipe["id"]) =>
  http.get<ReadonlyArray<IRecipeTimelineEvent>>(
    `/api/v1/recipes/${id}/timeline`,
  )

export function useTimelineList(recipeId: number) {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "timeline", recipeId],
    queryFn: () =>
      getRecipeTimeline(recipeId)
        .then(unwrapResult)
        .then((res) => res.map(toTimelineEvent)),
  })
}
