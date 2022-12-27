import { useMutation } from "@tanstack/react-query"

import { deleteLoggedInUser } from "@/api"
import { unwrapResult } from "@/query"

export function useUserDelete() {
  return useMutation({
    mutationFn: () => deleteLoggedInUser().then(unwrapResult),
  })
}
