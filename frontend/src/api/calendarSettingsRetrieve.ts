// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function calendarSettingsRetrieve() {
  return http<{
    syncEnabled: boolean
    calendarLink: string
  }>({
    url: "/api/v1/calendar/settings/",
    method: "get",
  })
}
