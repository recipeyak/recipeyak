// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function calendarDelete(params: { scheduled_recipe_id: number }) {
  return http<unknown>({
    url: "/api/v1/calendar/{scheduled_recipe_id}/",
    method: "delete",
    params,
    pathParamNames: ["scheduled_recipe_id"],
  })
}
