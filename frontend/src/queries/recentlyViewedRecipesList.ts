import { useQuery } from "@tanstack/react-query"
import * as t from "io-ts"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { unwrapEither } from "@/query"

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
