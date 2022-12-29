import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { createReaction, IRecipe } from "@/api"
import { useTeamId, useUser } from "@/hooks"
import { Reaction } from "@/pages/recipe-detail/Reactions"
import { unwrapResult } from "@/query"
import { uuid4 } from "@/uuid"

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
        user: {
          id: user.id || 0,
          name: user.name,
        },
      }
      queryClient.setQueryData(
        [teamId, "recipes", vars.recipeId],
        (prev: IRecipe | undefined): IRecipe | undefined => {
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
      )
      return { newReactionTempId: newReaction.id }
    },
    onSuccess: (res, vars, context) => {
      if (context?.newReactionTempId == null) {
        return
      }
      queryClient.setQueryData(
        [teamId, "recipes", vars.recipeId],
        (prev: IRecipe | undefined): IRecipe | undefined => {
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
      )
    },
    onError: (_err, vars, context) => {
      if (context?.newReactionTempId == null) {
        return
      }
      queryClient.setQueryData(
        [teamId, "recipes", vars.recipeId],
        (prev: IRecipe | undefined): IRecipe | undefined => {
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
      )
    },
  })
}
