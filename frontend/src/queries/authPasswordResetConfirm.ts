import { useMutation } from "@tanstack/react-query"

import { userPasswordResetConfirm } from "@/api/userPasswordResetConfirm"

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
      userPasswordResetConfirm({
        uid,
        token,
        new_password1: newPassword1,
        new_password2: newPassword2,
      }),
  })
}
