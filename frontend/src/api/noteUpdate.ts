// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function noteUpdate(params: {
  text?: string | null
  attachment_upload_ids?: ReadonlyArray<string> | null
  note_id: string
}) {
  return http<{
    id: string
    text: string
    created_by: {
      id: number
      name: string
      email: string
      avatar_url: string
    }
    last_modified_by: {
      id: number
      name: string
      email: string
      avatar_url: string
    } | null
    created: string
    modified: string
    attachments: Array<{
      id: string
      url: string
      backgroundUrl: string | null
      contentType: string
      isPrimary: boolean
      type: "upload"
    }>
    reactions: Array<{
      id: string
      type: "❤️" | "😆" | "🤮"
      note_id: number
      user: {
        id: number
        name: string
        email: string
        avatar_url: string
      }
      created: string
    }>
    type: "note"
  }>({
    url: "/api/v1/notes/{note_id}/",
    method: "patch",
    params,
    pathParamNames: ["note_id"],
  })
}