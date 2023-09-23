import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { IUser } from "@/queries/userFetch"
import { unwrapResult } from "@/query"

export interface IUserResponse {
  readonly user: IUser
}

const loginUser = (email: string, password: string) =>
  http.post<IUserResponse>("/api/v1/auth/login/", {
    email,
    password,
  })

export function useAuthLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password).then(unwrapResult),
  })
}
