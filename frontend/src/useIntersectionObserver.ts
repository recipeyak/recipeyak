import { RefObject, useEffect, useState } from "react"

// HACK: this leaks memory
let seenBefore = new Set<string>()

type Entry = Pick<IntersectionObserverEntry, "isIntersecting">

// from: https://usehooks-ts.com/react-hook/use-intersection-observer
export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  elementId: string | undefined,
  {
    threshold = 0,
    root = null,
    rootMargin = "0%",
    freezeOnceVisible = true,
  }: IntersectionObserverInit & { freezeOnceVisible?: boolean },
): Entry | undefined {
  const [entry, setEntry] = useState<Entry>({
    isIntersecting: elementId != null && seenBefore.has(elementId),
  })

  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = ([entry]: Entry[]): void => {
    // Keep track of seen Images so we don't have a flash of "not intersecting"
    // when navigating from the browser page to the detail page and back
    if (entry.isIntersecting && freezeOnceVisible && elementId != null) {
      seenBefore.add(elementId)
    }
    setEntry(entry)
  }

  useEffect(() => {
    const node = elementRef?.current // DOM Ref

    if (!window.IntersectionObserver || frozen || !node) {
      return
    }
    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef?.current, JSON.stringify(threshold), root, rootMargin, frozen])

  return entry
}
