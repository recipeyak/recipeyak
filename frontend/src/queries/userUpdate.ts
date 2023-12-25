import { useMutation, useQueryClient } from "@tanstack/react-query"

import { login } from "@/auth"
import { http } from "@/http"
import { unwrapResult } from "@/query"
import { Theme, ThemeMode } from "@/themeConstants"

export function useUserUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      readonly email?: string
      readonly name?: string
      readonly schedule_team?: number
      readonly theme_day?: Theme
      readonly theme_night?: Theme
      readonly theme_mode?: ThemeMode
    }) =>
      http
        .patch<{
          readonly id: number
          readonly name: string
          readonly avatar_url: string
          readonly email: string
          readonly theme_day: Theme
          readonly theme_night: Theme
          readonly theme_mode: ThemeMode
          readonly schedule_team: number | null
        }>("/api/v1/user/", payload)
        .then(unwrapResult),
    onSuccess: (res) => {
      login(res, queryClient)
    },
  })
}
