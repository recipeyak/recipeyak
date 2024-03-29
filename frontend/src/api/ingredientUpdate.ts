// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function ingredientUpdate(params: {
  quantity?: string | null
  name?: string | null
  description?: string | null
  position?: string | null
  optional?: boolean | null
  ingredient_id: number
}) {
  return http<{
    id: number
    quantity: string
    name: string
    description: string
    position: string
    optional: boolean
  }>({
    url: "/api/v1/ingredients/{ingredient_id}/",
    method: "patch",
    params,
    pathParamNames: ["ingredient_id"],
  })
}
