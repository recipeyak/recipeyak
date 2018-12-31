import { http } from "@/http"
import {
  IUser,
  ISocialConnection,
  SocialProvider,
  IUserStats
} from "@/store/reducers/user"
import { ITeam, IMember } from "@/store/reducers/teams"
import store from "@/store/store"
import { IShoppingListItem } from "@/store/reducers/shoppinglist"
import { pyFormat } from "@/date"
import { IRecipeBasic } from "@/components/RecipeTitle"
import { IRecipe, IIngredient, IStep } from "@/store/reducers/recipes"
import { CancelToken } from "axios"
import { IInvite } from "@/store/reducers/invites"
import { ICalRecipe } from "@/store/reducers/calendar"
import { subWeeks, startOfMonth, addWeeks, endOfMonth } from "date-fns"

export const updateUser = (data: Partial<IUser>) =>
  http.patch<IUser>("/api/v1/user/", data)
export const getUser = () => http.get<IUser>("/api/v1/user/")

export const deleteLoggedInUser = () => http.delete("/api/v1/user/")

export const logoutUser = () => http.post<void>("/api/v1/rest-auth/logout/", {})

export const loginUserWithSocial = (service: SocialProvider, token: string) =>
  http.post<{ user: IUser }>(`/api/v1/rest-auth/${service}/`, {
    code: token
  })

export const connectSocial = (service: SocialProvider, code: unknown) =>
  http.post<void>(`/api/v1/rest-auth/${service}/connect/`, {
    code
  })

export const signup = (email: string, password1: string, password2: string) =>
  http.post<{ user: IUser }>("/api/v1/rest-auth/registration/", {
    email,
    password1,
    password2
  })

export const loginUser = (email: string, password: string) =>
  http.post<{ user: IUser }>("/api/v1/rest-auth/login/", {
    email,
    password
  })

export const getSocialConnections = () =>
  http.get<ISocialConnection[]>("/api/v1/rest-auth/socialaccounts/")

export const disconnectSocialAccount = (id: ISocialConnection["id"]) =>
  http.post(`/api/v1/rest-auth/socialaccounts/${id}/disconnect/`, {
    id
  })

interface IDetailResponse {
  readonly detail: string
}

export const resetPassword = (email: string) =>
  http.post<IDetailResponse>("/api/v1/rest-auth/password/reset/", {
    email
  })

export const resetPasswordConfirm = (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string
) =>
  http.post<IDetailResponse>("/api/v1/rest-auth/password/reset/confirm/", {
    uid,
    token,
    new_password1: newPassword1,
    new_password2: newPassword2
  })

export const getUserStats = () => http.get<IUserStats>("api/v1/user_stats/")

export const changePassword = (
  password1: string,
  password2: string,
  oldPassword: string
) =>
  http.post("/api/v1/rest-auth/password/change/", {
    new_password1: password1,
    new_password2: password2,
    old_password: oldPassword
  })

export const getShoppingList = (
  teamID: ITeam["id"] | "personal",
  start?: Date,
  end?: Date
) => {
  const startDay = start || store.getState().shoppinglist.startDay
  const endDay = end || store.getState().shoppinglist.endDay
  const url =
    teamID === "personal"
      ? "/api/v1/shoppinglist/"
      : `/api/v1/t/${teamID}/shoppinglist/`
  return http.get<IShoppingListItem[]>(url, {
    params: {
      start: pyFormat(startDay),
      end: pyFormat(endDay)
    }
  })
}

export const createRecipe = (recipe: IRecipeBasic) =>
  http.post<IRecipe>("/api/v1/recipes/", recipe)

export const getRecipe = (id: IRecipe["id"]) =>
  http.get<IRecipe>(`/api/v1/recipes/${id}/`)

export const deleteRecipe = (id: IRecipe["id"]) =>
  http.delete(`/api/v1/recipes/${id}/`)

export const getRecentRecipes = () =>
  http.get<IRecipe[]>("/api/v1/recipes/?recent")

export const getRecipeList = (teamID: ITeam["id"] | "personal") => {
  const url =
    teamID === "personal" ? "/api/v1/recipes/" : `/api/v1/t/${teamID}/recipes/`
  return http.get<IRecipe[]>(url)
}

export const searchRecipes = (query: string, cancelToken: CancelToken) =>
  http.get<IRecipe[]>(`/api/v1/recipes?q=${encodeURI(query)}`, {
    cancelToken
  })

export const addIngredientToRecipe = (
  recipeID: IRecipe["id"],
  ingredient: unknown
) =>
  http.post<IIngredient>(`/api/v1/recipes/${recipeID}/ingredients/`, ingredient)

export const addStepToRecipe = (recipeID: IRecipe["id"], step: unknown) =>
  http.post<IStep>(`/api/v1/recipes/${recipeID}/steps/`, {
    text: step
  })

// TODO(sbdchd): this shouldn't require recipeID
export const updateIngredient = (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"],
  content: unknown
) =>
  http.patch<IIngredient>(
    `/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`,
    content
  )

// TODO(sbdchd): this shouldn't require recipeID
export const deleteIngredient = (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"]
) => http.delete(`/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`)

export const updateRecipe = (id: IRecipe["id"], data: unknown) =>
  http.patch<IRecipe>(`/api/v1/recipes/${id}/`, data)

// TODO(sbdchd): this shouldn't require recipeID
export const updateStep = (
  recipeID: IRecipe["id"],
  stepID: IStep["id"],
  data: { readonly [key: string]: unknown }
) => http.patch<IStep>(`/api/v1/recipes/${recipeID}/steps/${stepID}/`, data)

// TODO(sbdchd): this shouldn't require recipeID
export const deleteStep = (recipeID: IRecipe["id"], stepID: IStep["id"]) =>
  http.delete(`/api/v1/recipes/${recipeID}/steps/${stepID}/`)

export const getTeam = (id: ITeam["id"]) => http.get<ITeam>(`/api/v1/t/${id}/`)

export const getTeamMembers = (id: ITeam["id"]) =>
  http.get<IMember[]>(`/api/v1/t/${id}/members/`)

export const getTeamRecipes = (id: ITeam["id"]) =>
  http.get<IRecipe[]>(`/api/v1/t/${id}/recipes/`)

export const updateTeamMemberLevel = (
  teamID: ITeam["id"],
  membershipID: IMember["id"],
  level: IMember["level"]
) =>
  http.patch<IMember>(`/api/v1/t/${teamID}/members/${membershipID}/`, { level })

export const deleteTeamMember = (
  teamID: ITeam["id"],
  memberID: IMember["id"]
) => http.delete(`/api/v1/t/${teamID}/members/${memberID}/`)

export const deleteTeam = (teamID: ITeam["id"]) =>
  http.delete(`/api/v1/t/${teamID}`)

export const sendTeamInvites = (
  teamID: ITeam["id"],
  emails: string[],
  level: IMember["level"]
) => http.post<void>(`/api/v1/t/${teamID}/invites/`, { emails, level })

export const getTeamList = () => http.get<ITeam[]>("/api/v1/t/")

export const createTeam = (
  name: string,
  emails: string[],
  level: IMember["level"]
) => http.post<ITeam>("/api/v1/t/", { name, emails, level })

export const updateTeam = (teamId: ITeam["id"], data: unknown) =>
  http.patch<ITeam>(`/api/v1/t/${teamId}/`, data)

// TODO(sbdchd): should owner be a userID?
export const moveRecipe = (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: unknown
) =>
  http.post<IRecipe>(`/api/v1/recipes/${recipeId}/move/`, { id: ownerId, type })

export const copyRecipe = (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: unknown
) =>
  http.post<IRecipe>(`/api/v1/recipes/${recipeId}/copy/`, { id: ownerId, type })

export const getInviteList = () => http.get<IInvite[]>("/api/v1/invites/")

export const acceptInvite = (id: IInvite["id"]) =>
  http.post(`/api/v1/invites/${id}/accept/`, {})

export const declineInvite = (id: IInvite["id"]) =>
  http.post(`/api/v1/invites/${id}/decline/`, {})

export const reportBadMerge = () => http.post("/api/v1/report-bad-merge", {})

export const getCalendarRecipeList = (
  teamID: ITeam["id"] | "personal",
  month: Date
) => {
  const url =
    teamID === "personal"
      ? "/api/v1/calendar/"
      : `/api/v1/t/${teamID}/calendar/`

  // TODO(sbdchd): I think this is wrong
  return http.get<ICalRecipe[]>(url, {
    params: {
      start: pyFormat(subWeeks(startOfMonth(month), 1)),
      end: pyFormat(addWeeks(endOfMonth(month), 1))
    }
  })
}

export const scheduleRecipe = (
  recipeID: IRecipe["id"],
  teamID: ITeam["id"] | "personal",
  on: Date,
  count: string | number
) => {
  const url =
    teamID === "personal"
      ? "/api/v1/calendar/"
      : `/api/v1/t/${teamID}/calendar/`
  return http.post<ICalRecipe>(url, {
    recipe: recipeID,
    on: pyFormat(on),
    count
  })
}

// TODO(sbdchd): we shouldn't need teamID here
export const deleteScheduledRecipe = (
  id: ICalRecipe["id"],
  teamID: ITeam["id"] | "personal"
) => {
  const url =
    teamID === "personal"
      ? `/api/v1/calendar/${id}/`
      : `/api/v1/t/${teamID}/calendar/${id}/`

  return http.delete(url)
}

// TODO(sbdchd): we shouldn't need teamID here
export const updateScheduleRecipe = (
  id: ICalRecipe["id"],
  teamID: ITeam["id"] | "personal",
  recipe: Partial<ICalRecipe>
) => {
  const url =
    teamID === "personal"
      ? `/api/v1/calendar/${id}/`
      : `/api/v1/t/${teamID}/calendar/${id}/`

  return http.patch<ICalRecipe>(url, recipe)
}
