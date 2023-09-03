import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

type UserById = {
  readonly avatar_url: string
  readonly email: string
  readonly name: string
  readonly id: number
  readonly created: string
  readonly stats: {
    readonly recipesAdd: number
    readonly recipesArchived: number
    readonly comments: number
    readonly scheduled: number
    readonly photos: number
    readonly primaryPhotos: number
  }
  readonly activity: ReadonlyArray<{
    readonly recipe_id: number
    readonly created_date: string
    readonly created: string
    readonly note_id: number
    readonly type:
      | "recipe_create"
      | "recipe_archived"
      | "comment_create"
      | "photo_created"
      | "primary_photo_created"
      | "recipe_scheduled"
  }>
}

const getUserById = ({ id }: { id: string }) =>
  http.get<UserById>(`/api/v1/user/${id}/`)

export function useUserById({ id }: { id: string }) {
  return useQuery({
    queryKey: ["user-by-id", id],
    queryFn: () => getUserById({ id }).then(unwrapResult),
  })
}
