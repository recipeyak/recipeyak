// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function sessionDelete(params: { session_id: string }) {
  return http<unknown>({
    url: "/api/v1/sessions/{session_id}/",
    method: "delete",
    params,
    pathParamNames: ["session_id"],
  })
}
