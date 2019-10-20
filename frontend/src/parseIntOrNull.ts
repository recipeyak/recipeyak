export function parseIntOrNull(s: string | undefined | null): number | null {
  if (s == null) {
    return null
  }
  const num = parseInt(s, 10)
  if (Number.isNaN(num)) {
    return null
  }
  return num
}
