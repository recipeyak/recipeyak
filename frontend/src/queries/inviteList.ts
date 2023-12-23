import { QueryClient, useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { ResponseFromUseQuery } from "@/queries/queryUtilTypes"
import { unwrapResult } from "@/query"

const getInviteList = () =>
  http.get<
    readonly {
      readonly id: number
      readonly created: string
      readonly status: "accepted" | "declined" | "open"
      readonly team: {
        readonly id: number
        readonly name: string
      }
      readonly creator: {
        readonly id: number
        readonly email: string
        readonly avatar_url: string
      }
    }[]
  >("/api/v1/invites/")

export function useInviteList() {
  return useQuery({
    queryKey: getQueryKey(),
    queryFn: () => getInviteList().then(unwrapResult),
  })
}

function getQueryKey() {
  return ["invites"] as const
}

type Response = ResponseFromUseQuery<ReturnType<typeof useInviteList>>

export function setQueryDataInviteList(
  client: QueryClient,
  {
    updater,
  }: {
    updater: (prev: Response | undefined) => Response | undefined
  },
) {
  client.setQueryData<Response>(getQueryKey(), updater)
}
