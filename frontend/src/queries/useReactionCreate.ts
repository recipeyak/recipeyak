import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { reactionCreate } from "@/api/reactionCreate"
import { PickVariant } from "@/queries/useQueryUtilTypes"
import {
  cacheUpsertRecipe,
  RecipeFetchResponse as Recipe,
} from "@/queries/useRecipeFetch"
import { useTeamId } from "@/useTeamId"
import { useUser } from "@/useUser"
import { uuid4 } from "@/uuid"

type Reaction = PickVariant<
  Recipe["timelineItems"][number],
  "note"
>["reactions"][number]

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
      noteId: string
      type: "❤️" | "😆" | "🤮"
    }) => reactionCreate({ type, note_id: noteId }),
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
      cacheUpsertRecipe(queryClient, {
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
      cacheUpsertRecipe(queryClient, {
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
      cacheUpsertRecipe(queryClient, {
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
