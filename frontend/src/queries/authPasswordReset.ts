import { useMutation } from "@tanstack/react-query"

import { resetPassword } from "@/api"
import { unwrapResult } from "@/query"

export function useAuthPasswordReset() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      resetPassword(email).then(unwrapResult),
  })
}
