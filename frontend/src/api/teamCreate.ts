// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function teamCreate(params: {
  name: string
  emails: ReadonlyArray<string>
  level: "admin" | "contributor" | "read"
}) {
  return http<{
    id: number
    name: string
  }>({
    url: "/api/v1/t/",
    method: "post",
    params,
  })
}
