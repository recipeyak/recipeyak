import { useMutation } from "@tanstack/react-query"

import { userPasswordReset } from "@/api/userPasswordReset"

export function useAuthPasswordReset() {
  return useMutation({
    mutationFn: userPasswordReset,
  })
}
