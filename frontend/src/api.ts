import { http } from "./store/actions"
import { IUser } from "./store/reducers/user"

export const updateUser = (data: Partial<IUser>) =>
  http.patch<IUser>("/api/v1/user/", data)
export const getUser = () => http.get<IUser>("/api/v1/user/")
