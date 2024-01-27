import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

type UserById = {
  readonly uploads: Array<{
    id: number
    url: string
    backgroundUrl: string | null
    contentType: string
    recipe: {
      id: number
      name: string
    }
  }>
}

const getUserUploadsList = ({ id }: { id: string }) =>
  http.get<UserById>(`/api/v1/user/${id}/uploads`)

export function useUserUploadsList({ id }: { id: string }) {
  return useQuery({
    queryKey: ["user-by-id", id, "uploads"],
    queryFn: () => getUserUploadsList({ id }).then(unwrapResult),
  })
}
