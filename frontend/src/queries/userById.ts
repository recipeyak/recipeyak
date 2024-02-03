import { useQuery } from "@tanstack/react-query"

import { userRetrieveById } from "@/api/userRetrieveById"

export function useUserById({ id }: { id: string }) {
  return useQuery({
    queryKey: ["user-by-id", id],
    queryFn: () => userRetrieveById({ user_id: id }),
  })
}
