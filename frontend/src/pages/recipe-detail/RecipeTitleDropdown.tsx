import React, { useState } from "react"
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
import { ScheduleModal } from "@/pages/recipe-detail/ScheduleModal"
import {
  deleteRecipe,
  IIngredient,
  updateRecipe,
} from "@/store/reducers/recipes"
import { toast } from "@/toast"
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

interface IDropdownProps {
  readonly recipeId: number
  readonly recipeName: string
  readonly toggleEditing: () => void
  readonly editingEnabled: boolean
  readonly className: string
}
export function Dropdown({
  recipeId,
  recipeName,
  toggleEditing,
  editingEnabled,
  className,
}: IDropdownProps) {
  const { ref, isOpen, toggle, close } = useDropdown()

  const [showScheduleModal, setShowScheduleModal] = useState(false)

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

  const handleCopyIngredients = React.useCallback(() => {
    copyToClipboard(ingredients)
    toast("Copied ingredients to clipboard!")
    close()
  }, [close, ingredients])

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
    setShowScheduleModal(true)
    close()
  }

  return (
    <DropdownContainer ref={ref} className={className}>
      <Button size="small" className="fs-14px" onClick={toggle}>
        Actions <Chevron />
      </Button>
      <DropdownMenu isOpen={isOpen} position="left">
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
      {showScheduleModal && (
        <ScheduleModal
          recipeId={recipeId}
          recipeName={recipeName}
          onClose={() => {
            setShowScheduleModal((s) => !s)
          }}
        />
      )}
    </DropdownContainer>
  )
}
