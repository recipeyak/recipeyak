// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function recipeDelete(params: { recipe_id: number }) {
  return http<unknown>({
    url: "/api/v1/recipes/{recipe_id}/",
    method: "delete",
    params,
    pathParamNames: ["recipe_id"],
  })
}
