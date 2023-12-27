import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"

export const searchClickCreate = (params: {
  readonly query: string
  readonly recipe: {
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
    readonly scheduledCount: number
  }
  readonly matches: Array<{
    readonly kind: string
    readonly value: string
  }>
}) => http.post(`/api/v1/search-click/`, params)
