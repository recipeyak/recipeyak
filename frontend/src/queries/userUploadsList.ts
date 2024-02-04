import { useQuery } from "@tanstack/react-query"

import { userUploadsList } from "@/api/userUploadsList"

export function useUserUploadsList({ id }: { id: string }) {
  return useQuery({
    queryKey: ["user-by-id", id, "uploads"],
    queryFn: () => userUploadsList({ user_id: id }),
  })
}
