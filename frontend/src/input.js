export const inputAbs = v => {
  const c = v.replace(/[^\d]/g, '')
  return c.length === 0
    ? 0
    : parseInt(c, 10)
}

export function atLeast1 (v) {
  const abs = inputAbs(v)
  return abs < 1
    ? 1
    : abs
}
