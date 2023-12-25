import { ReactionType } from "@/pages/recipe-detail/Reactions"
import { PickVariant } from "@/queries/queryUtilTypes"
import { RecipeFetchResponse as Recipe } from "@/queries/recipeFetch"

type Reaction = PickVariant<
  Recipe["timelineItems"][number],
  "note"
>["reactions"][number]

export function findReaction(
  reactions: readonly Reaction[],
  type: ReactionType,
  userId: number,
) {
  return reactions.find(
    (reaction) => reaction.type === type && reaction.user.id === userId,
  )
}
