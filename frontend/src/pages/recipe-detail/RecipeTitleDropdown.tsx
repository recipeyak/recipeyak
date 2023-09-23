import React, { useState } from "react"

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
import { ScheduleModal } from "@/pages/recipe-detail/ScheduleModal"
import { pathCookDetail } from "@/paths"
import { useRecipeDelete } from "@/queries/recipeDelete"
import { IIngredient, RecentSchedule } from "@/queries/recipeFetch"
import { useRecipeUpdate } from "@/queries/recipeUpdate"
import { toast } from "@/toast"

function ingredientToString(ingre: IIngredient) {
  const s = ingre.quantity.trim() + " " + ingre.name.trim()
  if (ingre.description) {
    return s + ", " + ingre.description.trim()
  }
  return s
}

interface IDropdownProps {
  readonly recipeId: number
  readonly recipeName: string
  readonly recipeIsArchived: boolean
  readonly recipeIngredients: readonly IIngredient[]
  readonly recipeRecentScheduleHistory: readonly RecentSchedule[]
  readonly toggleEditing: () => void
  readonly editingEnabled: boolean
  readonly className: string
}
export function Dropdown({
  recipeId,
  recipeName,
  recipeIsArchived: isArchived,
  recipeIngredients,
  recipeRecentScheduleHistory,
  toggleEditing,
  editingEnabled,
  className,
}: IDropdownProps) {
  const { ref, isOpen, toggle, close } = useDropdown()

  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const ingredients = recipeIngredients.map(ingredientToString).join("\n")

  const updateRecipe = useRecipeUpdate()
  const deleteRecipe = useRecipeDelete()

  const isDeleting = deleteRecipe.isLoading

  const handleCopyIngredients = React.useCallback(() => {
    copyToClipboard(ingredients)
    toast("Copied ingredients to clipboard!")
    close()
  }, [close, ingredients])

  const archiveRecipe = React.useCallback(() => {
    if (confirm("Are you sure you want to archive this recipe?")) {
      updateRecipe.mutate(
        {
          recipeId,
          update: {
            // TODO: this api should support something like 'now'
            archived_at: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            close()
          },
        },
      )
    }
  }, [close, recipeId, updateRecipe])

  const unArchiveRecipe = React.useCallback(() => {
    updateRecipe.mutate(
      {
        recipeId,
        update: {
          archived_at: null,
        },
      },
      {
        onSuccess: () => {
          close()
        },
      },
    )
  }, [close, updateRecipe, recipeId])

  const handleDeleteRecipe = React.useCallback(() => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      deleteRecipe.mutate({ recipeId })
    }
  }, [deleteRecipe, recipeId])

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
        <DropdownItemLink
          to={pathCookDetail({ recipeId: recipeId.toString() })}
        >
          Start Cooking
        </DropdownItemLink>
        <DropdownItemButton onClick={handleCopyIngredients}>
          Copy Ingredients
        </DropdownItemButton>
        <DropdownItemLink to={{ search: "timeline=1" }} onClick={close}>
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
          scheduleHistory={recipeRecentScheduleHistory}
          onClose={() => {
            setShowScheduleModal(false)
          }}
        />
      )}
    </DropdownContainer>
  )
}
