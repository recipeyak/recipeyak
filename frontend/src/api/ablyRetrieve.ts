// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function ablyRetrieve() {
  return http<Record<string, unknown>>({
    url: "/api/v1/auth/ably/",
    method: "get",
  })
}
