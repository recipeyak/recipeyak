import { useMutation, useQueryClient } from "@tanstack/react-query"

import { login } from "@/auth"
import { http } from "@/http"
import { IUser } from "@/queries/userFetch"
import { unwrapResult } from "@/query"
import { Theme, ThemeMode } from "@/themeConstants"

const updateUser = (
  data: Pick<Partial<IUser>, "name" | "email" | "schedule_team">,
) => http.patch<IUser>("/api/v1/user/", data)

export function useUserUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      email?: string
      name?: string
      schedule_team?: number
      theme_day?: Theme
      theme_night?: Theme
      theme_mode?: ThemeMode
    }) => updateUser(payload).then(unwrapResult),
    onSuccess: (res) => {
      login(res, queryClient)
    },
  })
}
