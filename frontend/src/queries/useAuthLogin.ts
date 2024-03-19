import { useMutation } from "@tanstack/react-query"

import { userLogin } from "@/api/userLogin"

export function useAuthLogin() {
  return useMutation({
    mutationFn: userLogin,
  })
}
