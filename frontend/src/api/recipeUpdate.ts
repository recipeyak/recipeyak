// generated by recipeyak.api.base.codegen
import { http } from "@/apiClient"

export function recipeUpdate(params: {
  name?: string | null
  author?: string | null
  time?: string | null
  tags?: ReadonlyArray<string> | null
  servings?: string | null
  source?: string | null
  archived_at?: Date | null
  primaryImageId?: string | null
  recipe_id: number
}) {
  return http<{
    id: number
    name: string
    author: string | null
    source: string | null
    time: string | null
    servings: string | null
    ingredients: Array<{
      id: number
      quantity: string
      name: string
      description: string
      position: string
      optional: boolean
    }>
    steps: Array<{
      id: number
      text: string
      position: string
    }>
    recentSchedules: Array<{
      id: number
      on: string
    }>
    timelineItems: Array<
      | {
          id: string
          text: string
          created_by: {
            id: number
            name: string
            email: string
            avatar_url: string
          }
          created: string
          modified: string
          attachments: Array<{
            id: string
            url: string
            backgroundUrl: string | null
            contentType: string
            isPrimary: boolean
            type: "upload"
          }>
          reactions: Array<{
            id: string
            type: "❤️" | "😆" | "🤮"
            note_id: number
            user: {
              id: number
              name: string
              email: string
              avatar_url: string
            }
            created: string
          }>
          type: "note"
        }
      | {
          id: number
          type: "recipe"
          action:
            | "created"
            | "archived"
            | "unarchived"
            | "deleted"
            | "scheduled"
            | "remove_primary_image"
            | "set_primary_image"
          created_by: {
            id: number
            name: string
            email: string
            avatar_url: string
          } | null
          is_scraped: boolean
          created: string
        }
    >
    sections: Array<{
      id: number
      title: string
      position: string
    }>
    modified: string
    created: string
    archived_at: string | null
    tags: Array<string> | null
    primaryImage: {
      id: string
      url: string
      backgroundUrl: string | null
      contentType: string
      author: string | null
    } | null
    versions: Array<{
      id: number
      created_at: string
      actor: {
        id: number
        name: string
        avatar_url: string
      } | null
      name: string
      author: string | null
      source: string | null
      time: string | null
      servings: string | null
      archived_at: string | null
      tags: Array<string> | null
      primary_image: {
        id: number
        url: string
        backgroundUrl: string | null
      } | null
      ingredients: Array<
        | {
            id: number | null
            type: "ingredient"
            description: string
            quantity: string
            name: string
            position: string
            optional: boolean
          }
        | {
            id: number | null
            type: "section"
            title: string
            position: string
          }
      >
      steps: Array<{
        id: number | null
        text: string
        position: string
      }>
    }>
  }>({
    url: "/api/v1/recipes/{recipe_id}/",
    method: "patch",
    params,
    pathParamNames: ["recipe_id"],
  })
}
