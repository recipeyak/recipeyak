import { useMutation } from "@tanstack/react-query"

import { signup } from "@/api"
import { unwrapResult } from "@/query"

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
