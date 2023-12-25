import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"
import { Theme, ThemeMode } from "@/themeConstants"

const loginUser = (email: string, password: string) =>
  http.post<{
    user: {
      readonly id: number
      readonly name: string
      readonly avatar_url: string
      readonly email: string
      readonly theme_day: Theme
      readonly theme_night: Theme
      readonly theme_mode: ThemeMode
      readonly schedule_team: number | null
    }
  }>("/api/v1/auth/login/", {
    email,
    password,
  })

export function useAuthLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password).then(unwrapResult),
  })
}
