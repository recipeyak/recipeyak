import * as t from "io-ts"

import { toISODateString } from "@/date"
import { http } from "@/http"
import { Reaction } from "@/pages/recipe-detail/Reactions"
import { isOk, Ok } from "@/result"

// User state from API
export interface IUser {
  readonly avatar_url: string
  readonly email: string
  readonly name: string
  readonly id: number
  readonly dark_mode_enabled: boolean
  readonly schedule_team: number | null
}

export interface ISession {
  readonly id: string
  readonly device: {
    readonly kind: "mobile" | "desktop" | null
    readonly os: string | null
    readonly browser: string | null
  }
  readonly last_activity: string
  readonly ip: string
  readonly current: boolean
}

export interface IIngredient {
  readonly id: number
  readonly quantity: string
  readonly name: string
  readonly description: string
  readonly position: string
  readonly optional: boolean
  readonly updating?: boolean
  readonly removing?: boolean
}

export interface IStep {
  readonly id: number
  readonly text: string
  readonly position: string
}

export interface IPublicUser {
  readonly id: string | number
  readonly name: string | null
  readonly avatar_url: string
}

export type Upload = {
  readonly id: string
  readonly url: string
  readonly backgroundUrl: string | null
  readonly type: "upload"
  readonly isPrimary: boolean
  readonly localId: string
}

export interface INote {
  readonly id: number
  readonly type: "note"
  readonly text: string
  readonly modified: string
  readonly created: string
  readonly attachments: Upload[]
  readonly reactions: Reaction[]
  readonly last_modified_by: IPublicUser
  readonly created_by: IPublicUser
}

export type RecipeTimelineItem = {
  type: "recipe"
  id: number
  action:
    | "created"
    | "archived"
    | "unarchived"
    | "deleted"
    | "scheduled"
    | "remove_primary_image"
    | "set_primary_image"
  created_by: IPublicUser | null
  created: string
}

export type TimelineItem = INote | RecipeTimelineItem

export interface IRecipe {
  readonly id: number
  readonly name: string
  readonly author: string | null
  readonly source: string | null
  readonly time: string
  readonly servings: string | null
  readonly steps: ReadonlyArray<IStep>
  readonly timelineItems: readonly TimelineItem[]
  readonly modified: string
  readonly tags?: string[]
  readonly ingredients: ReadonlyArray<IIngredient>
  readonly sections: ReadonlyArray<{
    readonly id: number
    readonly title: string
    readonly position: string
  }>
  readonly primaryImage?: {
    id: string
    url: string
    author?: string
    backgroundUrl: string | null
  }
  readonly created: string
  readonly archived_at: string | null
}

export const updateUser = (
  data: Pick<Partial<IUser>, "name" | "email" | "schedule_team">,
) => http.patch<IUser>("/api/v1/user/", data)
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

// eslint-disable-next-line no-restricted-syntax
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

type GetShoppingListV2ResponseRecipe = {
  scheduledRecipeId: number
  recipeId: number
  recipeName: string
}

export interface IGetShoppingListResponse {
  readonly recipes: GetShoppingListV2ResponseRecipe[]
  readonly ingredients: {
    readonly [_: string]: IIngredientItem | undefined
  }
}

export const getShoppingList = (
  teamID: number | "personal",
  start: Date | number,
  end: Date | number,
) => {
  return http.get<IGetShoppingListResponse>(
    `/api/v1/t/${teamID}/shoppinglist/`,
    {
      params: {
        start: toISODateString(start),
        end: toISODateString(end),
        with_recipes: 1,
      },
    },
  )
}

export const getSessions = () =>
  http.get<ReadonlyArray<ISession>>("/api/v1/sessions/")
export const deleteAllSessions = () => http.delete("/api/v1/sessions/")
export const deleteSessionById = (id: ISession["id"]) =>
  http.delete(`/api/v1/sessions/${id}/`)

export const createRecipe = (
  recipe:
    | {
        readonly team: number | undefined
        readonly name: string
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

export type RecipeListItem = {
  readonly id: number
  readonly name: string
  readonly author: string | null
  readonly tags: readonly string[] | null
  readonly ingredients: readonly {
    id: number
    quantity: string
    name: string
  }[]
  readonly archived_at: string | null
  readonly primaryImage: {
    id: number
    url: string
    backgroundUrl: string | null
  } | null
}

export const getRecipeList = () => {
  return http.get<RecipeListItem[]>("/api/v1/recipes/")
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
  content: {
    quantity?: string
    name?: string
    description?: string
    optional?: boolean
    position?: string
  },
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
  noteId: string | number
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
export const deleteReaction = ({
  reactionId,
}: {
  reactionId: number | string
}) => http.delete(`/api/v1/reactions/${reactionId}/`)
export const uploadImage = async ({
  image,
  recipeId,
  onProgress,
}: {
  image: File
  recipeId: number
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
    recipe_id: recipeId,
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

export interface IMember {
  readonly id: number
  readonly user: IUser
  readonly level: "admin" | "contributor" | "read"
  readonly deleting?: boolean
  readonly is_active: boolean
}

export interface ITeam {
  readonly id: number
  readonly name: string
  readonly updating?: boolean
  readonly sendingTeamInvites?: boolean
  readonly loadingTeam?: boolean
  readonly loadingMembers?: boolean
  readonly error404?: boolean
  readonly recipes?: number[]
  readonly members: {
    readonly [key: number]: IMember | undefined
  }
}

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

export const updateTeam = (teamId: ITeam["id"], data: { name: string }) =>
  http.patch<ITeam>(`/api/v1/t/${teamId}/`, data)

export interface IInvite {
  readonly id: number
  readonly accepting?: boolean
  readonly declining?: boolean
  readonly status: "accepted" | "declined" | "open"
  readonly active: boolean
  readonly team: {
    readonly id: number
    readonly name: string
  }
  readonly creator: {
    readonly id: number
    readonly email: string
    readonly avatar_url: string
  }
}
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
  readonly teamID: number
  readonly start: Date
  readonly end: Date
}) {
  return getCalendarRecipeListRequestBuilder({ teamID, start, end }).send()
}

export type CalendarResponse = {
  scheduledRecipes: ICalRecipe[]
  settings: {
    syncEnabled: boolean
    calendarLink: string
  }
}

export function getCalendarRecipeListRequestBuilder({
  teamID,
  start,
  end,
}: {
  readonly teamID: number
  readonly start: Date
  readonly end: Date
}) {
  const id = teamID
  return http.obj({
    method: "GET",
    url: `/api/v1/t/${id}/calendar/`,
    shape: t.type({
      scheduledRecipes: t.array(
        t.type({
          id: t.number,
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
            author: t.union([t.string, t.null]),
            archivedAt: t.union([t.string, t.null]),
            primaryImage: t.union([
              t.type({
                id: t.string,
                url: t.string,
                backgroundUrl: t.union([t.string, t.null]),
              }),
              t.null,
            ]),
          }),
        }),
      ),
      settings: t.type({
        syncEnabled: t.boolean,
        calendarLink: t.string,
      }),
    }),
    params: {
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
        author: t.union([t.string, t.null]),
        archivedAt: t.union([t.string, t.null]),
        primaryImage: t.union([
          t.type({
            id: t.number,
            url: t.string,
            backgroundUrl: t.union([t.string, t.null]),
          }),
          t.null,
        ]),
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
        author: t.union([t.string, t.null]),
        archivedAt: t.union([t.string, t.null]),
        primaryImage: t.union([
          t.type({
            id: t.number,
            url: t.string,
            backgroundUrl: t.union([t.string, t.null]),
          }),
          t.null,
        ]),
      }),
    ),
  })
}

export interface ICalRecipe {
  readonly id: number
  readonly on: string
  readonly created: string
  readonly createdBy: {
    readonly id: number | string
    readonly name: string
    readonly avatar_url: string
  } | null
  readonly recipe: {
    readonly id: number
    readonly name: string
  }
}

export function generateCalendarLink({ teamID }: { readonly teamID: number }) {
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
) => {
  return http.post<ICalRecipe>(`/api/v1/t/${teamID}/calendar/`, {
    recipe: recipeID,
    on: toISODateString(on),
  })
}

// TODO(sbdchd): we shouldn't need teamID here
export const deleteScheduledRecipe = (
  calId: ICalRecipe["id"],
  teamID: number,
) => {
  return http.delete(`/api/v1/t/${teamID}/calendar/${calId}/`)
}

// TODO(sbdchd): we shouldn't need teamID here
export const updateScheduleRecipe = (
  calId: ICalRecipe["id"],
  teamID: number,
  recipe: Partial<ICalRecipe>,
) => {
  return http.patch<ICalRecipe>(
    `/api/v1/t/${teamID}/calendar/${calId}/`,
    recipe,
  )
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
