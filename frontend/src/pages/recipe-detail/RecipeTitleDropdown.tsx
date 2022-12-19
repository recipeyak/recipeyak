import React from "react"
import { useLocation } from "react-router-dom"

import { copyToClipboard } from "@/clipboard"
import { Button } from "@/components/Buttons"
import {
  DropdownContainer,
  DropdownItemButton,
  DropdownItemLink,
  DropdownMenu,
  useDropdown,
} from "@/components/Dropdown"
import { Chevron } from "@/components/icons"
import { useDispatch, useSelector } from "@/hooks"
import {
  deleteRecipe,
  duplicateRecipe,
  IIngredient,
  IRecipe,
  updateRecipe,
} from "@/store/reducers/recipes"
import { showNotificationWithTimeoutAsync } from "@/store/thunks"
import { isSuccessLike } from "@/webdata"

function ingredientToString(ingre: IIngredient) {
  const s = ingre.quantity + " " + ingre.name
  if (ingre.description) {
    return s + ", " + ingre.description
  }
  return s
}

function useIngredientString(recipeId: number) {
  return useSelector((s) => {
    const r = s.recipes.byId[recipeId]
    if (isSuccessLike(r)) {
      return r.data.ingredients.map(ingredientToString).join("\n")
    }
    return ""
  })
}

interface IUseDuplicateRecipe {
  readonly recipeId: IRecipe["id"]
  readonly onComplete?: () => void
}

function useDuplicateRecipe({
  recipeId,
  onComplete,
}: IUseDuplicateRecipe): [boolean, () => void] {
  const dispatch = useDispatch()

  const onDuplicate = React.useCallback(() => {
    dispatch(duplicateRecipe.request({ recipeId, onComplete }))
  }, [dispatch, onComplete, recipeId])

  const isDuplicating = useSelector(
    (s) => !!s.recipes.duplicatingById[recipeId],
  )

  return [isDuplicating, onDuplicate]
}

interface IDropdownProps {
  readonly recipeId: number
  readonly toggleEditing: () => void
  readonly editingEnabled: boolean
  readonly toggleScheduling: () => void
  readonly className: string
}
export function Dropdown({
  recipeId,
  toggleEditing,
  editingEnabled,
  toggleScheduling,
  className,
}: IDropdownProps) {
  const { ref, isOpen, toggle, close } = useDropdown()

  const location = useLocation()
  const dispatch = useDispatch()
  const ingredients = useIngredientString(recipeId)
  const [isArchived, isDeleting] = useSelector((s) => {
    const maybeRecipe = s.recipes.byId[recipeId]
    if (maybeRecipe?.kind === "Success") {
      return [!!maybeRecipe.data.archived_at, !!maybeRecipe.data.deleting]
    }
    return [false, false]
  })

  const [creatingDuplicate, onDuplicate] = useDuplicateRecipe({
    recipeId,
    onComplete: close,
  })

  const handleCopyIngredients = React.useCallback(() => {
    copyToClipboard(ingredients)
    showNotificationWithTimeoutAsync(dispatch)({
      message: "Copied ingredients to clipboard!",
      level: "info",
    })
    close()
  }, [close, dispatch, ingredients])

  const archiveRecipe = React.useCallback(() => {
    if (confirm("Are you sure you want to archive this recipe?")) {
      dispatch(
        updateRecipe.request({
          id: recipeId,
          data: { archived_at: new Date().toISOString() },
        }),
      )
      close()
    }
  }, [close, dispatch, recipeId])

  const unArchiveRecipe = React.useCallback(() => {
    dispatch(
      updateRecipe.request({
        id: recipeId,
        data: { archived_at: null },
      }),
    )
    close()
  }, [close, dispatch, recipeId])

  const handleDeleteRecipe = React.useCallback(() => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      dispatch(deleteRecipe.request(recipeId))
    }
  }, [dispatch, recipeId])

  const handleSchedule = () => {
    toggleScheduling()
    close()
  }

  return (
    <DropdownContainer ref={ref} className={className}>
      <Button size="small" className="fs-14px" onClick={toggle}>
        Actions <Chevron />
      </Button>
      <DropdownMenu isOpen={isOpen}>
        <DropdownItemButton onClick={handleSchedule}>
          Schedule
        </DropdownItemButton>
        <DropdownItemButton onClick={handleCopyIngredients}>
          Copy Ingredients
        </DropdownItemButton>
        <DropdownItemLink
          to={location.pathname + "?timeline=1"}
          onClick={close}
        >
          View Timeline
        </DropdownItemLink>
        <DropdownItemButton
          onClick={() => {
            toggleEditing()
            close()
          }}
        >
          {editingEnabled ? "Disable Editing" : "Enable Editing"}
        </DropdownItemButton>
        <DropdownItemButton onClick={onDuplicate}>
          <span>Duplicate</span>
          {creatingDuplicate && <span>(creating...)</span>}
        </DropdownItemButton>
        {!isArchived ? (
          <DropdownItemButton onClick={archiveRecipe}>
            Archive
          </DropdownItemButton>
        ) : (
          <DropdownItemButton onClick={unArchiveRecipe}>
            Unarchive
          </DropdownItemButton>
        )}

        <DropdownItemButton onClick={handleDeleteRecipe}>
          {!isDeleting ? "Delete" : "Deleting..."}
        </DropdownItemButton>
      </DropdownMenu>
    </DropdownContainer>
  )
}
