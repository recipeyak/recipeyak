import { configureAbly, useChannel } from "@ably-labs/react-hooks"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { addWeeks, endOfWeek, startOfWeek, subWeeks } from "date-fns"
import parseISO from "date-fns/parseISO"
import * as t from "io-ts"

import { toISODateString } from "@/date"
import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { CalendarResponse } from "@/queries/scheduledRecipeCreate"
import { onRecipeDeletion } from "@/queries/scheduledRecipeDelete"
import { onScheduledRecipeUpdateSuccess } from "@/queries/scheduledRecipeUpdate"
import { unwrapEither } from "@/query"

configureAbly({
  authUrl: "/api/v1/auth/ably/",
})

type ScheduledRecipeUpdated = {
  created: string
  createdBy: null
  id: number
  on: string
  recipe: { id: number; name: string }
  team: null
  user: null
}

export function getCalendarRecipeList({
  teamID,
  start,
  end,
}: {
  readonly teamID: number
  readonly start: Date
  readonly end: Date
}) {
  return http
    .obj({
      method: "GET",
      url: `/api/v1/t/${teamID}/calendar/`,
      shape: t.type({
        scheduledRecipes: t.array(
          t.type({
            id: t.number,
            on: t.string,
            created: t.string,
            createdBy: t.union([
              t.type({
                id: t.number,
                name: t.string,
                avatar_url: t.string,
              }),
              t.null,
            ]),
            team: t.union([t.number, t.null]),
            user: t.union([t.number, t.null]),
            recipe: t.type({
              id: t.number,
              name: t.string,
              author: t.union([t.string, t.null]),
              archivedAt: t.union([t.string, t.null]),
              primaryImage: t.union([
                t.type({
                  id: t.string,
                  url: t.string,
                  backgroundUrl: t.union([t.string, t.null]),
                }),
                t.null,
              ]),
            }),
          }),
        ),
        settings: t.type({
          syncEnabled: t.boolean,
          calendarLink: t.string,
        }),
      }),
      params: {
        start: toISODateString(start),
        end: toISODateString(end),
      },
    })
    .send()
}

// NOTE: At a high level we want the UI to be able to subscribe to a range of
// data, like, all the calendar items with date > X && date < Y. We also want to
// prefetch a bit in the past and future. But react-query doesn't really support
// this sort of range of selection, it likes specific items with it's keys so we
// do some hacky cache munging down below.

export function useScheduledRecipeList({
  startOfWeekMs,
}: {
  startOfWeekMs: number
}) {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  useChannel(`scheduled_recipe:${teamID}`, (message) => {
    switch (message.name) {
      case "scheduled_recipe_updated": {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const apiRes: ScheduledRecipeUpdated = JSON.parse(message.data)
        onScheduledRecipeUpdateSuccess({
          queryClient,
          scheduledRecipeId: apiRes.id,
          teamID,
          updatedCalRecipe: apiRes,
        })
        break
      }
      case "scheduled_recipe_delete": {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const apiRes: { recipeId: number } = JSON.parse(message.data)
        onRecipeDeletion(queryClient, {
          teamId: teamID,
          scheduledRecipeId: apiRes.recipeId,
        })
        break
      }
    }
  })
  return useQuery({
    queryKey: [teamID, "calendar", startOfWeekMs],
    queryFn: () => {
      // Fetch for a given week w/ 2 weeks after & 2 weeks before
      // We paginate by week, so we overlap our fetched range
      // We want a fetch to overwrite the cache for the range
      // We want to avoid dupes with our fetches
      const start = startOfWeek(subWeeks(startOfWeekMs, 3))
      const end = endOfWeek(addWeeks(startOfWeekMs, 3))
      return getCalendarRecipeList({ teamID, start, end }).then(unwrapEither)
    },
    onSuccess: (response) => {
      // Iterate through and populate each based on week
      const weekIds = new Set<number>()
      response.scheduledRecipes.forEach((r) => {
        const weekId = startOfWeek(parseISO(r.on)).getTime()
        weekIds.add(weekId)
      })
      weekIds.forEach((weekId) => {
        queryClient.setQueryData<CalendarResponse>(
          [teamID, "calendar", weekId],
          response,
        )
      })
    },
    // Schedule recipes plop in due the way we overlap/prefetch without this
    keepPreviousData: true,
  })
}
