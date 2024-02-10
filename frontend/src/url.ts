import { IMAGE_TRANSFORM_FORMAT } from "@/settings"

export function pathNamesEqual(a: string, b: string): boolean {
  const urlA = new URL(a, "https://example.com")
  const urlB = new URL(b, "https://example.com")
  return urlA.pathname === urlB.pathname
}

function imigx(url: string, transforms: Record<string, string>): string {
  if (url === "" || !url.startsWith("http")) {
    return url
  }
  const u = new URL(url)
  for (const [k, v] of Object.entries(transforms)) {
    u.searchParams.set(k, v)
  }
  return u.toString()
}
function twicpic(url: string, transforms: Record<string, string>): string {
  if (url === "" || !url.startsWith("http")) {
    return url
  }
  const u = new URL(url)

  u.searchParams.delete("twic")
  let query = "twic=v1"
  for (const [k, v] of Object.entries(transforms)) {
    query += "/" + k + "=" + v
  }
  if (u.search) {
    u.search += "&" + query
  } else {
    u.search = query
  }
  return u.toString()
}

/**
 * Image sizes supported:
 * 100x100 for comment thumbnail images
 * 620x470 for header image
 * 1152x864 for gallery
 */
export function formatImg(url: string) {
  if (IMAGE_TRANSFORM_FORMAT === "imgix") {
    return imigx(url, { w: "1200", q: "30", fit: "clip" })
  }
  if (IMAGE_TRANSFORM_FORMAT === "twicpics") {
    return twicpic(url, { resize: "1200", quality: "30" })
  }
  throw Error(`Unexpected transform format:${IMAGE_TRANSFORM_FORMAT}`)
}

export function formatImgSmall(url: string) {
  if (IMAGE_TRANSFORM_FORMAT === "imgix") {
    return imigx(url, { w: "200", q: "100", fit: "clip" })
  }
  if (IMAGE_TRANSFORM_FORMAT === "twicpics") {
    return twicpic(url, { resize: "200", quality: "100" })
  }
  throw Error(`Unexpected transform format:${IMAGE_TRANSFORM_FORMAT}`)
}

/**
 *  Open graph images are recommended to be 1200x630, so we use Imgix to crop.
 */
export function formatImgOpenGraph(url: string): string {
  if (IMAGE_TRANSFORM_FORMAT === "imgix") {
    return imigx(url, { w: "1200", h: "910", fit: "crop" })
  }
  if (IMAGE_TRANSFORM_FORMAT === "twicpics") {
    return twicpic(url, { cover: "1200x910", quality: "30" })
  }
  throw Error(`Unexpected transform format:${IMAGE_TRANSFORM_FORMAT}`)
}
