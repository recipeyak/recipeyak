import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { http } from "@/http"
import { PickVariant } from "@/queries/queryUtilTypes"
import {
  RecipeFetchResponse as Recipe,
  setQueryDataRecipe,
} from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"
import { useUser } from "@/useUser"
import { uuid4 } from "@/uuid"

type Reaction = PickVariant<
  Recipe["timelineItems"][number],
  "note"
>["reactions"][number]

const createReaction = ({
  noteId,
  type,
}: {
  noteId: string | number
  type: "❤️" | "😆" | "🤮"
}) =>
  http.post<{
    id: string
    type: "❤️" | "😆" | "🤮"
    // TODO: is this needed?
    note_id: number
    user: {
      id: number
      name: string
      email: string
      avatar_url: string
    }
    created: string
  }>(`/api/v1/notes/${noteId}/reactions/`, {
    type,
  })

export function useReactionCreate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  const user = useUser()
  return useMutation({
    mutationFn: ({
      noteId,
      type,
    }: {
      // keep recipeId for easier updating state
      recipeId: number
      noteId: number | string
      type: "❤️" | "😆" | "🤮"
    }) => createReaction({ noteId, type }).then(unwrapResult),

    onMutate: (vars) => {
      // add reaction
      const tempId = uuid4()
      const newReaction: Reaction = {
        id: tempId,
        created: new Date().toISOString(),
        type: vars.type,
        note_id: -1,
        user: {
          id: user.id || 0,
          name: user.name,
          email: user.email,
          avatar_url: user.avatarURL,
        },
      }
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.timelineItems.forEach((timelineItem) => {
              if (
                timelineItem.type === "note" &&
                timelineItem.id === vars.noteId
              ) {
                timelineItem.reactions.push(newReaction)
              }
            })
          })
        },
      })
      return { newReactionTempId: newReaction.id }
    },
    onSuccess: (res, vars, context) => {
      if (context?.newReactionTempId == null) {
        return
      }
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.timelineItems.forEach((timelineItem) => {
              if (
                timelineItem.type === "note" &&
                timelineItem.id === vars.noteId
              ) {
                timelineItem.reactions = timelineItem.reactions.filter(
                  (reaction) => reaction.id !== context?.newReactionTempId,
                )
                timelineItem.reactions.push(res)
              }
            })
          })
        },
      })
    },
    onError: (_err, vars, context) => {
      if (context?.newReactionTempId == null) {
        return
      }
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.timelineItems.forEach((timelineItem) => {
              if (
                timelineItem.type === "note" &&
                timelineItem.id === vars.noteId
              ) {
                timelineItem.reactions = timelineItem.reactions.filter(
                  (reaction) => reaction.id !== context?.newReactionTempId,
                )
              }
            })
          })
        },
      })
    },
  })
}
