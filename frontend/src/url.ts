import { IMAGE_TRANSFORM_FORMAT } from "@/settings"

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
export function formatImg(url: string) {
  if (url === "" || !url.startsWith("http")) {
    return url
  }
  const u = new URL(url)
  if (IMAGE_TRANSFORM_FORMAT === "imgix") {
    u.searchParams.set("w", "1200")
    u.searchParams.set("q", "30")
    u.searchParams.set("fit", "clip")
    return u.toString()
  }
  if (IMAGE_TRANSFORM_FORMAT === "twicpics") {
    const query = "twic=v1/resize=1200/quality=30"
    if (u.search) {
      u.search += "&" + query
    } else {
      u.search = query
    }
    return u.toString()
  }
  throw Error(`Unexpected transform format:${IMAGE_TRANSFORM_FORMAT}`)
}

export function formatImgSmall(url: string) {
  if (url === "" || !url.startsWith("http")) {
    return url
  }
  const u = new URL(url)
  if (IMAGE_TRANSFORM_FORMAT === "imgix") {
    u.searchParams.set("w", "200")
    u.searchParams.set("q", "100")
    u.searchParams.set("fit", "clip")

    return u.toString()
  }
  if (IMAGE_TRANSFORM_FORMAT === "twicpics") {
    const query = "twic=v1/resize=200/quality=100"
    if (u.search) {
      u.search += "&" + query
    } else {
      u.search = query
    }
    return u.toString()
  }
  throw Error(`Unexpected transform format:${IMAGE_TRANSFORM_FORMAT}`)
}

/**
 *  Open graph images are recommended to be 1200x630, so we use Imgix to crop.
 */
export function formatImgOpenGraph(x: string): string {
  if (!x) {
    return x
  }
  const u = new URL(x)
  if (IMAGE_TRANSFORM_FORMAT === "imgix") {
    u.searchParams.set("w", "1200")
    u.searchParams.set("h", "910")
    u.searchParams.set("fit", "crop")
    return u.toString()
  }

  if (IMAGE_TRANSFORM_FORMAT === "twicpics") {
    const query = "twic=v1/cover=1200x910/quality=30"
    if (u.search) {
      u.search += "&" + query
    } else {
      u.search = query
    }
    return u.toString()
  }
  throw Error(`Unexpected transform format:${IMAGE_TRANSFORM_FORMAT}`)
}
