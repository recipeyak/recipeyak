import { useQuery } from "@tanstack/react-query"

import { getRecipeTimeline, IRecipeTimelineEvent } from "@/api"
import { unwrapEither } from "@/query"
import { resultToEither } from "@/result"

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
  return useQuery(["timeline", recipeId], () =>
    getRecipeTimeline(recipeId)
      .then(resultToEither)
      .then(unwrapEither)
      .then((res) => res.map(toTimelineEvent)),
  )
}
