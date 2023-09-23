import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { IUser } from "@/queries/userFetch"
import { unwrapResult } from "@/query"

const resetPasswordConfirm = (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string,
) =>
  http.post<IUser>("/api/v1/auth/password/reset/confirm/", {
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
