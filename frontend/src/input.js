export const inputAbs = v => {
  const c = v.replace(/[^\d]/g, '')
  return c.length === 0
    ? 0
    : parseInt(c, 10)
}
