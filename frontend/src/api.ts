import * as t from "io-ts"

import { toISODateString } from "@/date"
import { http } from "@/http"
import { isOk, Ok } from "@/result"
import { ICalRecipe } from "@/store/reducers/calendar"
import { IInvite } from "@/store/reducers/invites"
import { IIngredient, INote, IRecipe, IStep } from "@/store/reducers/recipes"
import { IMember, ITeam } from "@/store/reducers/teams"
import { ISession, IUser } from "@/store/reducers/user"

export const updateUser = (data: Partial<IUser>) =>
  http.patch<IUser>("/api/v1/user/", data)
export const getUser = () => http.get<IUser>("/api/v1/user/")

export const deleteLoggedInUser = () => http.delete("/api/v1/user/")

export const logoutUser = () => http.post<void>("/api/v1/auth/logout/", {})

export interface IUserResponse {
  readonly user: IUser
}

export const signup = (email: string, password1: string, password2: string) =>
  http.post<IUserResponse>("/api/v1/auth/registration/", {
    email,
    password1,
    password2,
  })

export const loginUser = (email: string, password: string) =>
  http.post<IUserResponse>("/api/v1/auth/login/", {
    email,
    password,
  })

interface IDetailResponse {
  readonly detail: string
}

export const resetPassword = (email: string) =>
  http.post<IDetailResponse>("/api/v1/auth/password/reset/", {
    email,
  })

export const resetPasswordConfirm = (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string,
) =>
  http.post<IUserResponse["user"]>("/api/v1/auth/password/reset/confirm/", {
    uid,
    token,
    new_password1: newPassword1,
    new_password2: newPassword2,
  })

export const changePassword = (
  password1: string,
  password2: string,
  oldPassword: string,
) =>
  http.post("/api/v1/auth/password/change/", {
    new_password1: password1,
    new_password2: password2,
    old_password: oldPassword,
  })

export const enum Unit {
  POUND = "POUND",
  OUNCE = "OUNCE",
  GRAM = "GRAM",
  KILOGRAM = "KILOGRAM",
  TEASPOON = "TEASPOON",
  TABLESPOON = "TABLESPOON",
  FLUID_OUNCE = "FLUID_OUNCE",
  CUP = "CUP",
  PINT = "PINT",
  QUART = "QUART",
  GALLON = "GALLON",
  LITER = "LITER",
  MILLILITER = "MILLILITER",
  SOME = "SOME",
  UNKNOWN = "UNKNOWN",
  NONE = "NONE",
}

export interface IQuantity {
  readonly quantity: string
  readonly unit: Unit
  readonly unknown_unit?: string | null
}

export interface IIngredientItem {
  readonly category?: string
  readonly quantities: ReadonlyArray<IQuantity>
}

export interface IGetShoppingListResponse {
  readonly [_: string]: IIngredientItem | undefined
}

export const getShoppingList = (
  teamID: number | "personal",
  start: Date,
  end: Date,
) => {
  const id = teamID === "personal" ? "me" : teamID
  return http.get<IGetShoppingListResponse>(`/api/v1/t/${id}/shoppinglist/`, {
    params: {
      start: toISODateString(start),
      end: toISODateString(end),
    },
  })
}

export const getSessions = () =>
  http.get<ReadonlyArray<ISession>>("/api/v1/sessions/")
export const deleteAllSessions = () => http.delete("/api/v1/sessions/")
export const deleteSessionById = (id: ISession["id"]) =>
  http.delete(`/api/v1/sessions/${id}`)

export const createRecipe = (
  recipe:
    | {
        readonly team: number | undefined
        readonly author?: string
        readonly name?: string
        readonly source?: string
        readonly servings?: string
        readonly time?: string
        readonly tags?: string[]
      }
    | { readonly team: number | undefined; readonly from_url: string },
) => http.post<IRecipe>("/api/v1/recipes/", recipe)

export const getRecipe = (id: IRecipe["id"]) =>
  http.get<IRecipe>(`/api/v1/recipes/${id}/`)

export interface IRecipeTimelineEvent {
  readonly id: number
  readonly on: string
}

export const getRecipeTimeline = (id: IRecipe["id"]) =>
  http.get<ReadonlyArray<IRecipeTimelineEvent>>(
    `/api/v1/recipes/${id}/timeline`,
  )

export const deleteRecipe = (id: IRecipe["id"]) =>
  http.delete(`/api/v1/recipes/${id}/`)

export const duplicateRecipe = (id: IRecipe["id"]) =>
  http.post<IRecipe>(`/api/v1/recipes/${id}/duplicate/`)

export const getRecipeList = () => {
  return http.get<IRecipe[]>("/api/v1/recipes/")
}

export const addIngredientToRecipe = (
  recipeID: IRecipe["id"],
  ingredient: unknown,
) =>
  http.post<IIngredient>(`/api/v1/recipes/${recipeID}/ingredients/`, ingredient)

export const addSectionToRecipe = ({
  recipeId,
  section,
  position,
}: {
  readonly recipeId: number
  readonly section: string
  readonly position: string
}) =>
  http.post<{ title: string; position: string; id: number }>(
    `/api/v1/recipes/${recipeId}/sections`,
    { title: section, position },
  )

export const updateSection = ({
  sectionId,
  position,
  title,
}: {
  readonly sectionId: number
  readonly position?: string
  readonly title?: string
}) =>
  http.patch<{ title: string; position: string; id: number }>(
    `/api/v1/sections/${sectionId}/`,
    { title, position },
  )

export const deleteSection = ({ sectionId }: { readonly sectionId: number }) =>
  http.delete(`/api/v1/sections/${sectionId}/`)

export const addStepToRecipe = (
  recipeID: IRecipe["id"],
  step: unknown,
  position: string,
) =>
  http.post<IStep>(`/api/v1/recipes/${recipeID}/steps/`, {
    text: step,
    position,
  })

// TODO(sbdchd): this shouldn't require recipeID
export const updateIngredient = (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"],
  content: unknown,
) =>
  http.patch<IIngredient>(
    `/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`,
    content,
  )

// TODO(sbdchd): this shouldn't require recipeID
export const deleteIngredient = (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"],
) => http.delete(`/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`)

interface IAddNoteToRecipe {
  readonly recipeId: IRecipe["id"]
  readonly note: string
  readonly attachmentUploadIds: string[]
}
export const addNoteToRecipe = ({
  recipeId,
  note,
  attachmentUploadIds,
}: IAddNoteToRecipe) =>
  http.post<INote>(`/api/v1/recipes/${recipeId}/notes/`, {
    text: note,
    attachment_upload_ids: attachmentUploadIds,
  })
export const createReaction = ({
  noteId,
  type,
}: {
  noteId: string
  type: "❤️" | "😆" | "🤮"
}) =>
  http.post<{
    id: string
    type: "❤️" | "😆" | "🤮"
    note_id: string
    user: {
      id: number
      name: string
    }
    created: string
  }>(`/api/v1/notes/${noteId}/reactions/`, {
    type,
  })
export const deleteReaction = ({ reactionId }: { reactionId: string }) =>
  http.delete(`/api/v1/reactions/${reactionId}/`)
export const uploadImage = async ({
  image,
  onProgress,
}: {
  image: File
  onProgress: (_: number) => void
}) => {
  const res = await http.post<{
    id: string
    upload_url: string
    upload_headers: Record<string, string>
  }>(`/api/v1/upload/`, {
    file_name: image.name,
    content_type: image.type,
    content_length: image.size,
  })
  if (!isOk(res)) {
    return res
  }
  const uploadRes = await http.put(res.data.upload_url, image, {
    headers: {
      ...res.data.upload_headers,
      "Content-Type": image.type,
    },
    onUploadProgress(progressEvent: { loaded: number; total: number }) {
      onProgress((progressEvent.loaded / progressEvent.total) * 100)
    },
  })
  if (!isOk(uploadRes)) {
    return uploadRes
  }

  const uploadFinished = await http.post<{ id: string; url: string }>(
    `/api/v1/upload/${res.data.id}/complete`,
  )
  if (!isOk(uploadFinished)) {
    return uploadFinished
  }
  return Ok(uploadFinished.data)
}

interface IUpdateNote {
  readonly noteId: INote["id"]
  readonly note: string
  readonly attachmentUploadIds: string[]
}
export const updateNote = ({
  noteId,
  note,
  attachmentUploadIds,
}: IUpdateNote) =>
  http.patch<INote>(`/api/v1/notes/${noteId}/`, {
    text: note,
    attachment_upload_ids: attachmentUploadIds,
  })
interface IDeleteNote {
  readonly noteId: INote["id"]
}
export const deleteNote = ({ noteId }: IDeleteNote) =>
  http.delete(`/api/v1/notes/${noteId}/`)

export const updateRecipe = (id: IRecipe["id"], data: unknown) =>
  http.patch<IRecipe>(`/api/v1/recipes/${id}/`, data)

interface IUpdateStepPayload {
  readonly text?: string
  readonly position?: string
}

// TODO(sbdchd): this shouldn't require recipeID
export const updateStep = (
  recipeID: IRecipe["id"],
  stepID: IStep["id"],
  data: IUpdateStepPayload,
) => http.patch<IStep>(`/api/v1/recipes/${recipeID}/steps/${stepID}/`, data)

// TODO(sbdchd): this shouldn't require recipeID
export const deleteStep = (recipeID: IRecipe["id"], stepID: IStep["id"]) =>
  http.delete(`/api/v1/recipes/${recipeID}/steps/${stepID}/`)

export const getTeam = (id: ITeam["id"]) => http.get<ITeam>(`/api/v1/t/${id}/`)

export const getTeamMembers = (id: ITeam["id"]) =>
  http.get<IMember[]>(`/api/v1/t/${id}/members/`)

export const updateTeamMemberLevel = (
  teamID: ITeam["id"],
  membershipID: IMember["id"],
  level: IMember["level"],
) =>
  http.patch<IMember>(`/api/v1/t/${teamID}/members/${membershipID}/`, { level })

export const deleteTeamMember = (
  teamID: ITeam["id"],
  memberID: IMember["id"],
) => http.delete(`/api/v1/t/${teamID}/members/${memberID}/`)

export const deleteTeam = (teamID: ITeam["id"]) =>
  http.delete(`/api/v1/t/${teamID}`)

export const sendTeamInvites = (
  teamID: ITeam["id"],
  emails: string[],
  level: IMember["level"],
) => http.post<void>(`/api/v1/t/${teamID}/invites/`, { emails, level })

export const getTeamList = () => http.get<ITeam[]>("/api/v1/t/")

export const createTeam = (
  name: string,
  emails: string[],
  level: IMember["level"],
) => http.post<ITeam>("/api/v1/t/", { name, emails, level })

export const updateTeam = (teamId: ITeam["id"], data: unknown) =>
  http.patch<ITeam>(`/api/v1/t/${teamId}/`, data)

// TODO(sbdchd): should owner be a userID?
export const moveRecipe = (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: unknown,
) =>
  http.post<IRecipe>(`/api/v1/recipes/${recipeId}/move/`, { id: ownerId, type })

export const copyRecipe = (
  recipeId: IRecipe["id"],
  ownerId: IUser["id"],
  type: unknown,
) =>
  http.post<IRecipe>(`/api/v1/recipes/${recipeId}/copy/`, { id: ownerId, type })

export const getInviteList = () => http.get<IInvite[]>("/api/v1/invites/")

export const acceptInvite = (id: IInvite["id"]) =>
  http.post<void>(`/api/v1/invites/${id}/accept/`, {})

export const declineInvite = (id: IInvite["id"]) =>
  http.post<void>(`/api/v1/invites/${id}/decline/`, {})

export function getCalendarRecipeList({
  teamID,
  start,
  end,
}: {
  readonly teamID: number | "personal"
  readonly start: Date
  readonly end: Date
}) {
  return getCalendarRecipeListRequestBuilder({ teamID, start, end }).send()
}

export function getCalendarRecipeListRequestBuilder({
  teamID,
  start,
  end,
}: {
  readonly teamID: number | "personal"
  readonly start: Date
  readonly end: Date
}) {
  const id = teamID === "personal" ? "me" : teamID
  return http.obj({
    method: "GET",
    url: `/api/v1/t/${id}/calendar/`,
    shape: t.type({
      scheduledRecipes: t.array(
        t.type({
          id: t.number,
          count: t.number,
          on: t.string,
          created: t.string,
          createdBy: t.union([
            t.type({
              id: t.number,
              name: t.string,
              avatar_url: t.string,
            }),
            t.null,
          ]),
          team: t.union([t.number, t.null]),
          user: t.union([t.number, t.null]),
          recipe: t.type({
            id: t.number,
            name: t.string,
          }),
        }),
      ),
      settings: t.type({
        syncEnabled: t.boolean,
        calendarLink: t.string,
      }),
    }),
    params: {
      v2: 1,
      start: toISODateString(start),
      end: toISODateString(end),
    },
  })
}

export function updateCalendarSettings({
  teamID,
  data,
}: {
  readonly teamID: number | "personal"
  readonly data: {
    readonly syncEnabled: boolean
  }
}) {
  return http.request({
    method: "PATCH",
    url: `/api/v1/t/${teamID}/calendar/settings/`,
    data,
    shape: t.type({
      syncEnabled: t.boolean,
      calendarLink: t.string,
    }),
  })
}

export function recentlyViewedRecipes() {
  return http.request({
    method: "GET",
    url: "/api/v1/recipes/recently_viewed",
    shape: t.array(
      t.type({
        id: t.number,
        name: t.string,
      }),
    ),
  })
}

export function recentlyCreatedRecipes() {
  return http.request({
    method: "GET",
    url: "/api/v1/recipes/recently_created",
    shape: t.array(
      t.type({
        id: t.number,
        name: t.string,
      }),
    ),
  })
}

export function generateCalendarLink({
  teamID,
}: {
  readonly teamID: number | "personal"
}) {
  return http.request({
    method: "POST",
    url: `/api/v1/t/${teamID}/calendar/generate_link/`,
    shape: t.type({
      calendarLink: t.string,
    }),
  })
}
export const scheduleRecipe = (
  recipeID: IRecipe["id"],
  teamID: number | "personal",
  on: Date | string,
  count: string | number = 1,
) => {
  const id = teamID === "personal" ? "me" : teamID
  return http.post<ICalRecipe>(`/api/v1/t/${id}/calendar/`, {
    recipe: recipeID,
    on: toISODateString(on),
    count,
  })
}

// TODO(sbdchd): we shouldn't need teamID here
export const deleteScheduledRecipe = (
  calId: ICalRecipe["id"],
  teamID: number | "personal",
) => {
  const id = teamID === "personal" ? "me" : teamID
  return http.delete(`/api/v1/t/${id}/calendar/${calId}/`)
}

// TODO(sbdchd): we shouldn't need teamID here
export const updateScheduleRecipe = (
  calId: ICalRecipe["id"],
  teamID: number | "personal",
  recipe: Partial<ICalRecipe>,
) => {
  const id = teamID === "personal" ? "me" : teamID
  return http.patch<ICalRecipe>(`/api/v1/t/${id}/calendar/${calId}/`, recipe)
}

export const findNextOpen = ({
  teamID,
  day,
  now,
}: {
  readonly teamID: number | "personal"
  readonly day: string
  readonly now: string
}) => {
  return http.get<{ readonly date: string }>(
    `/api/v1/t/${teamID}/calendar/next_open/`,
    {
      params: {
        day,
        now,
      },
    },
  )
}
