export const inputAbs = (v: string) => {
  const c = v.replace(/[^\d]/g, '')
  return c.length === 0
    ? 0
    : parseInt(c, 10)
}
