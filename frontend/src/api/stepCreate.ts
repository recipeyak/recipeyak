// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function stepCreate(params: {
  text: string
  position?: string | null
  recipe_id: number
}) {
  return http<{
    id: number
    text: string
    position: string
  }>({
    url: "/api/v1/recipes/{recipe_id}/steps/",
    method: "post",
    params,
    pathParamNames: ["recipe_id"],
  })
}