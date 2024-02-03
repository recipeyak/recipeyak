// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function recipeTimline(params: { recipe_id: number }) {
  return http<
    Array<{
      id: number
      on: string
    }>
  >({
    url: "/api/v1/recipes/{recipe_id}/timeline",
    method: "get",
    params,
    pathParamNames: ["recipe_id"],
  })
}
