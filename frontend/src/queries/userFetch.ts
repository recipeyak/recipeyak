import { useQuery, useQueryClient } from "@tanstack/react-query"

import { login } from "@/auth"
import { http } from "@/http"
import { unwrapResult } from "@/query"

export type Theme = "light" | "autumn" | "solarized" | "dark" | "dark_dimmed"

// User state from API
export interface IUser {
  readonly avatar_url: string
  readonly email: string
  readonly name: string
  readonly id: number
  readonly theme: Theme
  readonly schedule_team: number | null
}

const getUser = () => http.get<IUser>("/api/v1/user/")

export function useUserFetch() {
  // TODO: this api call could be removed with a preload
  const queryClient = useQueryClient()
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["user-detail"],
    queryFn: async () => {
      const res = await getUser().then(unwrapResult)
      login(res, queryClient)
      return res
    },
  })
}
