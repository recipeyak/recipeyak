import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { reactionDelete } from "@/api/reactionDelete"
import { PickVariant } from "@/queries/queryUtilTypes"
import {
  cacheUpsertRecipe,
  RecipeFetchResponse as Recipe,
} from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

type Reaction = PickVariant<
  Recipe["timelineItems"][number],
  "note"
>["reactions"][number]

export function useReactionDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      reactionId,
    }: {
      // extra id to make updating cache easier
      recipeId: number
      // extra id to make updating cache easier
      noteId: number | string
      reactionId: string
    }) => reactionDelete({ reaction_id: reactionId }),
    onMutate: (vars) => {
      let previousReaction: Reaction | undefined
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
                  (reaction) => {
                    if (reaction.id === vars.reactionId) {
                      previousReaction = reaction
                      return false
                    }
                    return true
                  },
                )
              }
            })
          })
        },
      })
      return { previousReaction }
    },
    onError: (_err, vars, context) => {
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
                timelineItem.id === vars.noteId &&
                context?.previousReaction != null
              ) {
                timelineItem.reactions.push(context.previousReaction)
              }
            })
          })
        },
      })
    },
  })
}
