import { useMutation } from "@tanstack/react-query"

import { loginUser } from "@/api"
import { unwrapResult } from "@/query"

export function useAuthLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password).then(unwrapResult),
  })
}
