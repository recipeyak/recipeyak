import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { prefetchRecipe } from "@/queries/useRecipeFetch"
import { useTeamId } from "@/useTeamId"

// Matches recipe detail and cook mode links, e.g. `/recipes/123-lasagna-soup`,
// but not `/recipes/123.yaml`.
const RECIPE_LINK_RE = /^\/(?:recipes|cook)\/(\d+)(?:-[^/]*)?\/?$/

// Skip prefetching when the cursor only passes over a link, e.g. while
// moving across the recipe grid.
const HOVER_DELAY_MS = 65

function recipeIdFromTarget(target: EventTarget | null): number | null {
  if (!(target instanceof Element)) {
    return null
  }
  const anchor = target.closest("a")
  if (anchor == null || anchor.origin !== window.location.origin) {
    return null
  }
  const match = RECIPE_LINK_RE.exec(anchor.pathname)
  if (match == null) {
    return null
  }
  return parseInt(match[1], 10)
}

/**
 * Prefetch a recipe when the user hovers, focuses, or presses a link to it,
 * so the detail page usually renders from cache on navigation.
 */
export function RecipeLinkPrefetch() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()

  useEffect(() => {
    if (teamId === -1) {
      return
    }
    let hoverTimer: ReturnType<typeof setTimeout> | undefined

    const prefetch = (target: EventTarget | null) => {
      const recipeId = recipeIdFromTarget(target)
      if (recipeId == null) {
        return
      }
      void prefetchRecipe(queryClient, { teamId, recipeId })
    }

    const onPointerOver = (e: PointerEvent) => {
      clearTimeout(hoverTimer)
      if (e.pointerType !== "mouse") {
        return
      }
      const target = e.target
      hoverTimer = setTimeout(() => {
        prefetch(target)
      }, HOVER_DELAY_MS)
    }
    const onPointerOut = () => {
      clearTimeout(hoverTimer)
    }
    // Touch and pen have no hover, so start as soon as the press begins.
    const onPointerDown = (e: PointerEvent) => {
      prefetch(e.target)
    }
    const onFocusIn = (e: FocusEvent) => {
      prefetch(e.target)
    }

    document.addEventListener("pointerover", onPointerOver, { passive: true })
    document.addEventListener("pointerout", onPointerOut, { passive: true })
    document.addEventListener("pointerdown", onPointerDown, { passive: true })
    document.addEventListener("focusin", onFocusIn)
    return () => {
      clearTimeout(hoverTimer)
      document.removeEventListener("pointerover", onPointerOver)
      document.removeEventListener("pointerout", onPointerOut)
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("focusin", onFocusIn)
    }
  }, [queryClient, teamId])
  return null
}
