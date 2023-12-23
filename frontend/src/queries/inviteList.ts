import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

export interface IInvite {
  readonly id: number
  readonly created: string
  readonly status: "accepted" | "declined" | "open"
  readonly active: boolean
  readonly team: {
    readonly id: number
    readonly name: string
  }
  readonly creator: {
    readonly id: number
    readonly email: string
    readonly avatar_url: string
  }
}

const getInviteList = () => http.get<IInvite[]>("/api/v1/invites/")

export function useInviteList() {
  return useQuery({
    queryKey: ["invites"],
    queryFn: () => getInviteList().then(unwrapResult),
  })
}
