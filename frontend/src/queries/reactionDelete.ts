import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { deleteReaction, IRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { Reaction } from "@/pages/recipe-detail/Reactions"
import { unwrapResult } from "@/query"

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
      reactionId: number | string
    }) => deleteReaction({ reactionId }).then(unwrapResult),
    onMutate: (vars) => {
      let previousReaction: Reaction | undefined
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
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
      )
      return { previousReaction }
    },
    onError: (_err, vars, context) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
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
      )
    },
  })
}
