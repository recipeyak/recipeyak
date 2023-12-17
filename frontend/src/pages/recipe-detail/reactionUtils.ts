import { ReactionType } from "@/pages/recipe-detail/Reactions"
import { Reaction } from "@/queries/recipeFetch"

export function findReaction(
  reactions: Reaction[],
  type: ReactionType,
  userId: number,
) {
  return reactions.find(
    (reaction) => reaction.type === type && reaction.user.id === userId,
  )
}
