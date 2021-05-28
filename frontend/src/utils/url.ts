export function pathNamesEqual(a: string, b: string): boolean {
  const urlA = new URL(a, "https://example.com")
  const urlB = new URL(b, "https://example.com")
  return urlA.pathname === urlB.pathname
}
