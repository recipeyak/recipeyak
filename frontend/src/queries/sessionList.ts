import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

export interface ISession {
  readonly id: string
  readonly device: {
    readonly kind: "mobile" | "desktop" | null
    readonly os: string | null
    readonly browser: string | null
  }
  readonly last_activity: string
  readonly ip: string | null
  readonly current: boolean
}

export const getSessions = () =>
  http.get<ReadonlyArray<ISession>>("/api/v1/sessions/")
export function useSessionList() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => getSessions().then(unwrapResult),
  })
}
