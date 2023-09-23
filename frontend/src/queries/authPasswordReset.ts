import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

interface IDetailResponse {
  readonly detail: string
}

export const resetPassword = (email: string) =>
  http.post<IDetailResponse>("/api/v1/auth/password/reset/", {
    email,
  })

export function useAuthPasswordReset() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      resetPassword(email).then(unwrapResult),
  })
}
