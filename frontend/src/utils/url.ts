export function pathNamesEqual(a: string, b: string): boolean {
  const urlA = new URL(a, "https://example.com")
  const urlB = new URL(b, "https://example.com")
  return urlA.pathname === urlB.pathname
}

/**
 * Image sizes supported:
 * 100x100 for comment thumbnail images
 * 620x470 for header image
 * 1152x864 for gallery
 */
export function imgixFmt(url: string) {
  if (url === "") {
    return url
  }
  const u = new URL(url)
  u.searchParams.set("max-w", "1200")
  u.searchParams.set("max-h", "900")
  u.searchParams.set("q", "30")
  u.searchParams.set("dpr", "2")
  u.searchParams.set("fit", "crop")
  return u.toString()
}
