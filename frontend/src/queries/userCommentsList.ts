import { useQuery } from "@tanstack/react-query"

import { userCommentsList } from "@/api/userCommentsList"

export function useUserCommentsList({ id }: { id: string }) {
  return useQuery({
    queryKey: ["user-by-id", id, "comments"],
    queryFn: () => userCommentsList({ user_id: id }),
  })
}
