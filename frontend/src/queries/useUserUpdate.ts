import { useMutation, useQueryClient } from "@tanstack/react-query"

import { userUpdate } from "@/api/userUpdate"
import { login } from "@/auth"
import { Theme, ThemeMode } from "@/themeConstants"

export function useUserUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      readonly email?: string
      readonly name?: string
      readonly schedule_team?: number
      readonly theme_day?: Theme
      readonly theme_night?: Theme
      readonly theme_mode?: ThemeMode
    }) => userUpdate(payload),
    onSuccess: (res) => {
      void login(res, queryClient)
    },
  })
}
