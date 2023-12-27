import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

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

function toTimelineEvent(event: { id: number; on: string }): ITimelineEvent {
  return {
    type: "scheduled",
    id: event.id,
    date: event.on,
  }
}

const getRecipeTimeline = (id: number) =>
  http.get<ReadonlyArray<{ id: number; on: string }>>(
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
