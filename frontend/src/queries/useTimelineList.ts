import { useQuery } from "@tanstack/react-query"

import { recipeTimline } from "@/api/recipeTimline"
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

export function useTimelineList(recipeId: number) {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "timeline", recipeId],
    queryFn: () =>
      recipeTimline({ recipe_id: recipeId }).then((res) =>
        res.map(toTimelineEvent),
      ),
  })
}
