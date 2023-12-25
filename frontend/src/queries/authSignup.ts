import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"
import { Theme, ThemeMode } from "@/themeConstants"

const signup = (email: string, password1: string, password2: string) =>
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
  }>("/api/v1/auth/registration/", {
    email,
    password1,
    password2,
  })

export function useAuthSignup() {
  return useMutation({
    mutationFn: ({
      email,
      password1,
      password2,
    }: {
      email: string
      password1: string
      password2: string
    }) => signup(email, password1, password2).then(unwrapResult),
  })
}
