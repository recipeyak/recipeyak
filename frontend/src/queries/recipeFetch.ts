import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { ReactionType } from "@/pages/recipe-detail/Reactions"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

export type Reaction = {
  id: string
  type: ReactionType
  user: {
    id: number
    name: string
  }
  created: string
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
  readonly contentType: string
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
  is_scraped: boolean
  created: string
}

export type TimelineItem = INote | RecipeTimelineItem

export type RecentSchedule = {
  readonly id: number
  readonly on: string
}

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
  readonly recentSchedules: ReadonlyArray<RecentSchedule>
  readonly sections: ReadonlyArray<{
    readonly id: number
    readonly title: string
    readonly position: string
  }>
  readonly primaryImage?: {
    id: string
    url: string
    author?: string
    contentType: string
    backgroundUrl: string | null
  }
  readonly created: string
  readonly archived_at: string | null
}

const getRecipe = (id: IRecipe["id"]) =>
  http.get<IRecipe>(`/api/v1/recipes/${id}/`)

export function useRecipeFetch({ recipeId }: { recipeId: number }) {
  const teamID = useTeamId()
  return useQuery({
    queryKey: [teamID, "recipes", recipeId],
    queryFn: () => getRecipe(recipeId).then(unwrapResult),
  })
}
