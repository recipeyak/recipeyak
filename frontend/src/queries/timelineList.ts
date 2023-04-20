import { useQuery } from "@tanstack/react-query"

import { getRecipeTimeline, IRecipeTimelineEvent } from "@/api"
import { useTeamId } from "@/hooks"
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
