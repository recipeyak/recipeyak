import { useMutation } from "@tanstack/react-query"

import { userCreate } from "@/api/userCreate"

export function useAuthSignup() {
  return useMutation({
    mutationFn: userCreate,
  })
}
