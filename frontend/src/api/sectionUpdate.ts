// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function sectionUpdate(params: {
  position?: string | null
  title?: string | null
  section_id: number
}) {
  return http<{
    id: number
    title: string
    position: string
  }>({
    url: "/api/v1/sections/{section_id}/",
    method: "patch",
    params,
    pathParamNames: ["section_id"],
  })
}
