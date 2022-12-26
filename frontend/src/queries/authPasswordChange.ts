import { useMutation } from "@tanstack/react-query"

import { changePassword } from "@/api"
import { unwrapResult } from "@/query"

export function useAuthPasswordChange() {
  return useMutation({
    mutationFn: ({
      password1,
      password2,
      oldPassword,
    }: {
      password1: string
      password2: string
      oldPassword: string
    }) => changePassword(password1, password2, oldPassword).then(unwrapResult),
  })
}
