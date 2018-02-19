export const inputAbs = val => {
  const clanedVal = val.replace(/[^\d]/g, '')
  const absVal = Math.abs(clanedVal)
  return Number.isNaN(absVal)
    ? clanedVal
    : absVal
}
