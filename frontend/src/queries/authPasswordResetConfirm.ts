import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"
import { Theme, ThemeMode } from "@/themeConstants"

const resetPasswordConfirm = (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string,
) =>
  http.post<{
    readonly id: number
    readonly name: string
    readonly avatar_url: string
    readonly email: string
    readonly theme_day: Theme
    readonly theme_night: Theme
    readonly theme_mode: ThemeMode
    readonly schedule_team: number | null
  }>("/api/v1/auth/password/reset/confirm/", {
    uid,
    token,
    new_password1: newPassword1,
    new_password2: newPassword2,
  })

export function useAuthPasswordResetConfirm() {
  return useMutation({
    mutationFn: ({
      uid,
      token,
      newPassword1,
      newPassword2,
    }: {
      uid: string
      token: string
      newPassword1: string
      newPassword2: string
    }) =>
      resetPasswordConfirm(uid, token, newPassword1, newPassword2).then(
        unwrapResult,
      ),
  })
}
