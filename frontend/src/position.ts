import * as ordering from "@/ordering"

export function getNewPos(
  list: ReadonlyArray<{ readonly position: string }>,
  index: number,
): string | null {
  const nextCard = list[index + 1]
  const prevCard = list[index - 1]
  if (nextCard == null && prevCard == null) {
    // there is only one card in the list, so we don't make any change
    return null
  }

  if (nextCard == null && prevCard != null) {
    return ordering.positionAfter(prevCard.position)
  }
  if (nextCard != null && prevCard == null) {
    return ordering.positionBefore(nextCard.position)
  }
  if (nextCard != null && prevCard != null) {
    return ordering.positionBetween(prevCard.position, nextCard.position)
  }
  return null
}

export function getNewPosIngredients(
  list: ReadonlyArray<{ readonly item: { readonly position: string } }>,
  index: number,
): string | null {
  const nextCard = list[index + 1]
  const prevCard = list[index - 1]
  if (nextCard == null && prevCard == null) {
    // there is only one card in the list, so we don't make any change
    return null
  }
  if (nextCard == null && prevCard != null) {
    return ordering.positionAfter(prevCard.item.position)
  }
  if (nextCard != null && prevCard == null) {
    return ordering.positionBefore(nextCard.item.position)
  }
  if (nextCard != null && prevCard != null) {
    return ordering.positionBetween(
      prevCard.item.position,
      nextCard.item.position,
    )
  }
  return null
}
