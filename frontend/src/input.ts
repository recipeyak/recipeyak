export const inputAbs = (v: string) => {
  const c = v.replace(/[^\d]/g, "")
  return c.length === 0 ? 0 : parseInt(c, 10)
}

export function atLeast1(v: string) {
  const abs = inputAbs(v)
  return abs < 1 ? 1 : abs
}
