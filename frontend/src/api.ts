import { http } from "@/http"
import {
  IUser,
  ISocialConnection,
  SocialProvider,
  IUserStats,
  ISession
} from "@/store/reducers/user"
import { ITeam, IMember } from "@/store/reducers/teams"
import store from "@/store/store"
import { IShoppingListItem } from "@/store/reducers/shoppinglist"
import { toDateString } from "@/date"
import { IRecipeBasic } from "@/components/RecipeTitle"
import { IRecipe, IIngredient, IStep } from "@/store/reducers/recipes"
import { IInvite } from "@/store/reducers/invites"
import { ICalRecipe } from "@/store/reducers/calendar"
import { subWeeks, addWeeks, startOfWeek, endOfWeek } from "date-fns"
import { AxiosError, AxiosResponse } from "axios"
import { Ok, Err } from "@/result"

const toOk = <T>(res: AxiosResponse<T>) => Ok(res.data)
const toErr = (res: AxiosError) => Err(res)

export const updateUser = (data: Partial<IUser>) =>
  http
    .patch<IUser>("/api/v1/user/", data)
    .then(toOk)
    .catch(toErr)

export const getUser = () =>
  http
    .get<IUser>("/api/v1/user/")
    .then(toOk)
    .catch(toErr)

export const deleteLoggedInUser = () =>
  http
    .delete("/api/v1/user/")
    .then(toOk)
    .catch(toErr)

export const logoutUser = () =>
  http
    .post<void>("/api/v1/auth/logout/", {})
    .then(toOk)
    .catch(toErr)

interface IUserResponse {
  readonly user: IUser
}

export const loginUserWithSocial = (service: SocialProvider, token: string) =>
  http
    .post<IUserResponse>(`/api/v1/auth/${service}/`, {
      code: token
    })
    .then(toOk)
    .catch(toErr)

export const connectSocial = (service: SocialProvider, code: unknown) =>
  http
    .post<void>(`/api/v1/auth/${service}/connect/`, {
      code
    })
    .then(toOk)
    .catch(toErr)

export const signup = (email: string, password1: string, password2: string) =>
  http
    .post<IUserResponse>("/api/v1/auth/registration/", {
      email,
      password1,
      password2
    })
    .then(toOk)
    .catch(toErr)

export const loginUser = (email: string, password: string) =>
  http
    .post<IUserResponse>("/api/v1/auth/login/", {
      email,
      password
    })
    .then(toOk)
    .catch(toErr)

export const getSocialConnections = () =>
  http
    .get<ISocialConnection[]>("/api/v1/auth/socialaccounts/")
    .then(toOk)
    .catch(toErr)

export const disconnectSocialAccount = (id: ISocialConnection["id"]) =>
  http
    .post(`/api/v1/auth/socialaccounts/${id}/disconnect/`, {
      id
    })
    .then(toOk)
    .catch(toErr)

interface IDetailResponse {
  readonly detail: string
}

export const resetPassword = (email: string) =>
  http
    .post<IDetailResponse>("/api/v1/auth/password/reset/", {
      email
    })
    .then(toOk)
    .catch(toErr)

export const resetPasswordConfirm = (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string
) =>
  http
    .post<IDetailResponse>("/api/v1/auth/password/reset/confirm/", {
      uid,
      token,
      new_password1: newPassword1,
      new_password2: newPassword2
    })
    .then(toOk)
    .catch(toErr)

export const getUserStats = () =>
  http
    .get<IUserStats>("api/v1/user_stats/")
    .then(toOk)
    .catch(toErr)

export const changePassword = (
  password1: string,
  password2: string,
  oldPassword: string
) =>
  http
    .post("/api/v1/auth/password/change/", {
      new_password1: password1,
      new_password2: password2,
      old_password: oldPassword
    })
    .then(toOk)
    .catch(toErr)

export const getShoppingList = (teamID: TeamID) => {
  const startDay = store.getState().shoppinglist.startDay
  const endDay = store.getState().shoppinglist.endDay
  const url =
    teamID === "personal"
      ? "/api/v1/shoppinglist/"
      : `/api/v1/t/${teamID}/shoppinglist/`
  return http
    .get<IShoppingListItem[]>(url, {
      params: {
        start: toDateString(startDay),
        end: toDateString(endDay)
      }
    })
    .then(toOk)
    .catch(toErr)
}

export const getSessions = () =>
  http
    .get<ReadonlyArray<ISession>>("/api/v1/sessions/")
    .then(toOk)
    .catch(toErr)
export const deleteAllSessions = () =>
  http
    .delete("/api/v1/sessions/")
    .then(toOk)
    .catch(toErr)
export const deleteSessionById = (id: ISession["id"]) =>
  http
    .delete(`/api/v1/sessions/${id}`)
    .then(toOk)
    .catch(toErr)

export const createRecipe = (recipe: IRecipeBasic) =>
  http
    .post<IRecipe>("/api/v1/recipes/", recipe)
    .then(toOk)
    .catch(toErr)

export const getRecipe = (id: IRecipe["id"]) =>
  http
    .get<IRecipe>(`/api/v1/recipes/${id}/`)
    .then(toOk)
    .catch(toErr)

export const deleteRecipe = (id: IRecipe["id"]) =>
  http
    .delete(`/api/v1/recipes/${id}/`)
    .then(toOk)
    .catch(toErr)

export const getRecentRecipes = () =>
  http
    .get<IRecipe[]>("/api/v1/recipes/?recent")
    .then(toOk)
    .catch(toErr)

export const getRecipeList = (teamID: TeamID) => {
  const url =
    teamID === "personal" ? "/api/v1/recipes/" : `/api/v1/t/${teamID}/recipes/`
  return http
    .get<IRecipe[]>(url)
    .then(toOk)
    .catch(toErr)
}

export const addIngredientToRecipe = (
  recipeID: IRecipe["id"],
  ingredient: unknown
) =>
  http
    .post<IIngredient>(`/api/v1/recipes/${recipeID}/ingredients/`, ingredient)
    .then(toOk)
    .catch(toErr)

export const addStepToRecipe = (recipeID: IRecipe["id"], step: unknown) =>
  http
    .post<IStep>(`/api/v1/recipes/${recipeID}/steps/`, {
      text: step
    })
    .then(toOk)
    .catch(toErr)

// TODO(sbdchd): this shouldn't require recipeID
export const updateIngredient = (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"],
  content: unknown
) =>
  http
    .patch<IIngredient>(
      `/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`,
      content
    )
    .then(toOk)
    .catch(toErr)

// TODO(sbdchd): this shouldn't require recipeID
export const deleteIngredient = (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"]
) =>
  http
    .delete(`/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`)
    .then(toOk)
    .catch(toErr)

export const updateRecipe = (id: IRecipe["id"], data: unknown) =>
  http
    .patch<IRecipe>(`/api/v1/recipes/${id}/`, data)
    .then(toOk)
    .catch(toErr)

// TODO(sbdchd): this shouldn't require recipeID
export const updateStep = (
  recipeID: IRecipe["id"],
  stepID: IStep["id"],
  data: { readonly [key: string]: unknown }
) =>
  http
    .patch<IStep>(`/api/v1/recipes/${recipeID}/steps/${stepID}/`, data)
    .then(toOk)
    .catch(toErr)

// TODO(sbdchd): this shouldn't require recipeID
export const deleteStep = (recipeID: IRecipe["id"], stepID: IStep["id"]) =>
  http
    .delete(`/api/v1/recipes/${recipeID}/steps/${stepID}/`)
    .then(toOk)
    .catch(toErr)

export const getTeam = (id: ITeam["id"]) =>
  http
    .get<ITeam>(`/api/v1/t/${id}/`)
    .then(toOk)
    .catch(toErr)

export const getTeamMembers = (id: ITeam["id"]) =>
  http
    .get<IMember[]>(`/api/v1/t/${id}/members/`)
    .then(toOk)
    .catch(toErr)

export const getTeamRecipes = (id: ITeam["id"]) =>
  http
    .get<IRecipe[]>(`/api/v1/t/${id}/recipes/`)
    .then(toOk)
    .catch(toErr)

export const updateTeamMemberLevel = (
  teamID: ITeam["id"],
  membershipID: IMember["id"],
  level: IMember["level"]
) =>
  http
    .patch<IMember>(`/api/v1/t/${teamID}/members/${membershipID}/`, { level })
    .then(toOk)
    .catch(toErr)

export const deleteTeamMember = (
  teamID: ITeam["id"],
  memberID: IMember["id"]
) =>
  http
    .delete(`/api/v1/t/${teamID}/members/${memberID}/`)
    .then(toOk)
    .catch(toErr)

export const deleteTeam = (teamID: ITeam["id"]) =>
  http
    .delete(`/api/v1/t/${teamID}`)
    .then(toOk)
    .catch(toErr)

export const sendTeamInvites = (
  teamID: ITeam["id"],
  emails: string[],
  level: IMember["level"]
) =>
  http
    .post<void>(`/api/v1/t/${teamID}/invites/`, { emails, level })
    .then(toOk)
    .catch(toErr)

export const getTeamList = () =>
  http
    .get<ITeam[]>("/api/v1/t/")
    .then(toOk)
    .catch(toErr)

export const createTeam = (
  name: string,
  emails: string[],
  level: IMember["level"]
) =>
  http
    .post<ITeam>("/api/v1/t/", { name, emails, level })
    .then(toOk)
    .catch(toErr)

export const updateTeam = (teamId: ITeam["id"], data: unknown) =>
  http
    .patch<ITeam>(`/api/v1/t/${teamId}/`, data)
    .then(toOk)
    .catch(toErr)

// TODO(sbdchd): should owner be a userID?
export const moveRecipe = (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: unknown
) =>
  http
    .post<IRecipe>(`/api/v1/recipes/${recipeId}/move/`, { id: ownerId, type })
    .then(toOk)
    .catch(toErr)

export const copyRecipe = (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: unknown
) =>
  http
    .post<IRecipe>(`/api/v1/recipes/${recipeId}/copy/`, { id: ownerId, type })
    .then(toOk)
    .catch(toErr)

export const getInviteList = () =>
  http
    .get<IInvite[]>("/api/v1/invites/")
    .then(toOk)
    .catch(toErr)

export const acceptInvite = (id: IInvite["id"]) =>
  http
    .post<void>(`/api/v1/invites/${id}/accept/`, {})
    .then(toOk)
    .catch(toErr)

export const declineInvite = (id: IInvite["id"]) =>
  http
    .post<void>(`/api/v1/invites/${id}/decline/`, {})
    .then(toOk)
    .catch(toErr)

export const reportBadMerge = () =>
  http
    .post("/api/v1/report-bad-merge", {})
    .then(toOk)
    .catch(toErr)

export const getCalendarRecipeList = (teamID: TeamID, currentDay: Date) => {
  const url =
    teamID === "personal"
      ? "/api/v1/calendar/"
      : `/api/v1/t/${teamID}/calendar/`

  const start = toDateString(startOfWeek(subWeeks(currentDay, 1)))
  const end = toDateString(endOfWeek(addWeeks(currentDay, 1)))

  return http
    .get<ICalRecipe[]>(url, {
      params: {
        start,
        end
      }
    })
    .then(toOk)
    .catch(toErr)
}

export const scheduleRecipe = (
  recipeID: IRecipe["id"],
  teamID: TeamID,
  on: Date,
  count: string | number
) => {
  const url =
    teamID === "personal"
      ? "/api/v1/calendar/"
      : `/api/v1/t/${teamID}/calendar/`
  return http
    .post<ICalRecipe>(url, {
      recipe: recipeID,
      on: toDateString(on),
      count
    })
    .then(toOk)
    .catch(toErr)
}

// TODO(sbdchd): we shouldn't need teamID here
export const deleteScheduledRecipe = (id: ICalRecipe["id"], teamID: TeamID) => {
  const url =
    teamID === "personal"
      ? `/api/v1/calendar/${id}/`
      : `/api/v1/t/${teamID}/calendar/${id}/`

  return http
    .delete(url)
    .then(toOk)
    .catch(toErr)
}

// TODO(sbdchd): we shouldn't need teamID here
export const updateScheduleRecipe = (
  id: ICalRecipe["id"],
  teamID: TeamID,
  recipe: Partial<ICalRecipe>
) => {
  const url =
    teamID === "personal"
      ? `/api/v1/calendar/${id}/`
      : `/api/v1/t/${teamID}/calendar/${id}/`

  return http
    .patch<ICalRecipe>(url, recipe)
    .then(toOk)
    .catch(toErr)
}
