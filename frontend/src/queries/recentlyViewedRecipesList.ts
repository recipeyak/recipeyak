import { useQuery } from "@tanstack/react-query"
import * as t from "io-ts"

import { http } from "@/http"
import { unwrapEither } from "@/query"
import { useTeamId } from "@/useTeamId"

export function recentlyViewedRecipes() {
  return http.request({
    method: "GET",
    url: "/api/v1/recipes/recently_viewed",
    shape: t.array(
      t.type({
        id: t.number,
        name: t.string,
        author: t.union([t.string, t.null]),
        archivedAt: t.union([t.string, t.null]),
        tags: t.array(t.string),
        ingredients: t.union([t.array()]),
        archived_at: t.string,
        scheduledCount: t.number,
        primaryImage: t.union([
          t.type({
            id: t.number,
            url: t.string,
            backgroundUrl: t.union([t.string, t.null]),
          }),
          t.null,
        ]),
      }),
    ),
  })
}

export function useRecentlyViewedRecipesList() {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "recently-viewed-recipes"],
    queryFn: () => recentlyViewedRecipes().then(unwrapEither),
  })
}
