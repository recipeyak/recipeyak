import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

const deleteLoggedInUser = () => http.delete("/api/v1/user/")

export function useUserDelete() {
  return useMutation({
    mutationFn: () => deleteLoggedInUser().then(unwrapResult),
  })
}
