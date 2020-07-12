export function getNewPos(
  list: ReadonlyArray<{ readonly position: number }>,
  index: number
): number | null {
  const nextCard = list[index + 1]
  const prevCard = list[index - 1]
  if (nextCard == null && prevCard == null) {
    // there is only one card in the list, so we don't make any change
    return null
  }
  if (nextCard == null && prevCard != null) {
    return prevCard.position + 10.0
  }
  if (nextCard != null && prevCard == null) {
    return nextCard.position / 2
  }
  if (nextCard != null && prevCard != null) {
    return (nextCard.position - prevCard.position) / 2 + prevCard.position
  }
  return null
}
