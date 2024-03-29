// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function uploadComplete(params: { upload_id: number }) {
  return http<{
    id: string
    url: string
    contentType: string
  }>({
    url: "/api/v1/upload/{upload_id}/complete",
    method: "post",
    params,
    pathParamNames: ["upload_id"],
  })
}
