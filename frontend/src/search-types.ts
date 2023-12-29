import { Hit } from "instantsearch.js"

export type RecipeYakHit = Hit<{
  readonly id: number
  readonly name: string
  readonly author: string | null
  readonly archived_at: string | null
  readonly primary_image?: {
    readonly url: string
    readonly background_url?: string
  }
}>
