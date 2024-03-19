import { useMutation } from "@tanstack/react-query"

import { userPasswordUpdate } from "@/api/userPasswordUpdate"

export function useAuthPasswordChange() {
  return useMutation({
    mutationFn: (params: {
      oldPassword: string
      password1: string
      password2: string
    }) =>
      userPasswordUpdate({
        old_password: params.oldPassword,
        new_password1: params.password1,
        new_password2: params.password2,
      }),
  })
}
