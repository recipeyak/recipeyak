import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { IUserResponse } from "@/queries/authLogin"
import { unwrapResult } from "@/query"

const signup = (email: string, password1: string, password2: string) =>
  http.post<IUserResponse>("/api/v1/auth/registration/", {
    email,
    password1,
    password2,
  })

export function useAuthSignup() {
  return useMutation({
    mutationFn: ({
      email,
      password1,
      password2,
    }: {
      email: string
      password1: string
      password2: string
    }) => signup(email, password1, password2).then(unwrapResult),
  })
}
