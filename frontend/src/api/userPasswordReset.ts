// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function userPasswordReset(params: { email: string }) {
  return http<{
    detail: string
  }>({
    url: "/api/v1/auth/password/reset/",
    method: "post",
    params,
  })
}
