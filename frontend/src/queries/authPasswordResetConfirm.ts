import { useMutation } from "@tanstack/react-query"

import { resetPasswordConfirm } from "@/api"
import { unwrapResult } from "@/query"

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
