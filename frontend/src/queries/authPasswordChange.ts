import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

export const changePassword = (
  password1: string,
  password2: string,
  oldPassword: string,
) =>
  http.post("/api/v1/auth/password/change/", {
    new_password1: password1,
    new_password2: password2,
    old_password: oldPassword,
  })

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
