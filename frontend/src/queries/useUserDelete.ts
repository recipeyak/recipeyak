import { useMutation } from "@tanstack/react-query"

import { userDelete } from "@/api/userDelete"

export function useUserDelete() {
  return useMutation({
    mutationFn: () => userDelete(),
  })
}
