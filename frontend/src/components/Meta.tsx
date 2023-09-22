import { groupBy } from "lodash-es"
import React from "react"

function updateOrCreateTag(
  metaTags: HTMLMetaElement[],
  property: string,
  value: string,
) {
  if (!value) {
    metaTags.forEach((x) => {
      x.remove()
    })
    return
  }
  if (metaTags.length > 0) {
    if (metaTags[0].content !== value) {
      metaTags[0].content = value
    }
    // clear out any dupe tags
    if (metaTags.length > 1) {
      metaTags.forEach((x, i) => {
        // we only want one metatag
        if (i > 0) {
          x.remove()
        }
      })
    }
  } else {
    // setup the missing metatag
    const metaTag = document.createElement("meta")
    // NOTE: property is missing from the type
    metaTag.setAttribute("property", property)
    metaTag.content = value
    document.head.appendChild(metaTag)
  }
}

export function Meta({ title, image }: { title: string; image: string }) {
  React.useEffect(() => {
    const metaTags = document.querySelectorAll<HTMLMetaElement>(
      `meta[property^="og:"]`,
    )
    const groupedMetatags = groupBy(metaTags, (x) => x.getAttribute("property"))

    updateOrCreateTag(groupedMetatags["og:title"] || [], "og:title", title)
    updateOrCreateTag(groupedMetatags["og:image"] || [], "og:image", image)
  }, [title, image])
  return null
}
