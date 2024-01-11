import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

type UserById = {
  readonly comments: Array<{
    recipe: {
      id: number
      name: string
    }
    note: {
      readonly id: string
      readonly text: string
      readonly created_by: {
        readonly id: number
        readonly name: string
        readonly email: string
        readonly avatar_url: string
      }
      readonly modified: string
      readonly created: string
      readonly attachments: ReadonlyArray<{
        readonly id: string
        readonly url: string
        readonly backgroundUrl: string | null
        readonly contentType: string
        readonly isPrimary: boolean
        readonly type: "upload"
      }>
      readonly reactions: ReadonlyArray<{
        readonly id: string
        readonly type: "❤️" | "😆" | "🤮"
        readonly note_id: number
        readonly user: {
          readonly id: number
          readonly name: string
          readonly email: string
          readonly avatar_url: string
        }
        readonly created: string
      }>
      readonly last_modified_by: {
        readonly id: number
        readonly name: string
        readonly email: string
        readonly avatar_url: string
      } | null
      readonly type: "note"
    }
  }>
}

const getUserCommentsList = ({ id }: { id: string }) =>
  http.get<UserById>(`/api/v1/user/${id}/comments`)

export function useUserCommentsList({ id }: { id: string }) {
  return useQuery({
    queryKey: ["user-by-id", id, "comments"],
    queryFn: () => getUserCommentsList({ id }).then(unwrapResult),
  })
}
