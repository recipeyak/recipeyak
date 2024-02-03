// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function teamList() {
  return http<
    Array<{
      id: number
      name: string
      created: string
      members: number
    }>
  >({
    url: "/api/v1/t/",
    method: "get",
  })
}