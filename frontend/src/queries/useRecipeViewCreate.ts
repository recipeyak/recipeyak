import { useEffect } from "react"

import { recipeViewCreate } from "@/api/recipeViewCreate"

/** Record a view when a recipe page opens, for the home page's recently viewed list. */
export function useRecipeViewCreate({ recipeId }: { recipeId: number }) {
  useEffect(() => {
    if (Number.isNaN(recipeId)) {
      return
    }
    // Fire and forget, a missed view isn't worth surfacing.
    recipeViewCreate({ recipe_id: recipeId }).catch(() => {})
  }, [recipeId])
}
