import React from "react"
import { useSelector, useDispatch } from "@/hooks"
import { scheduleURLFromTeamID } from "@/store/mapState"
import { copyToClipboard } from "@/clipboard"
import { isSuccessLike } from "@/webdata"
import { showNotificationWithTimeoutAsync } from "@/store/thunks"
import { Chevron } from "@/components/icons"
import {
  IIngredient,
  duplicateRecipe,
  IRecipe,
  updateRecipe,
} from "@/store/reducers/recipes"
import { Button } from "@/components/Buttons"
import {
  DropdownContainer,
  DropdownItemLink,
  DropdownItemButton,
  DropdownMenu,
  useDropdown,
} from "@/components/Dropdown"

function useScheduleUrl(recipeId: number) {
  return useSelector(scheduleURLFromTeamID) + `?recipeId=${recipeId}`
}

function ingredientToString(ingre: IIngredient) {
  const s = ingre.quantity + " " + ingre.name
  if (ingre.description) {
    return s + ", " + ingre.description
  }
  return s
}

function useIngredientString(recipeId: number) {
  return useSelector(s => {
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

  const isDuplicating = useSelector(s => !!s.recipes.duplicatingById[recipeId])

  return [isDuplicating, onDuplicate]
}

interface IDropdownProps {
  readonly recipeId: number
}
export function Dropdown({ recipeId }: IDropdownProps) {
  const { ref, isOpen, toggle, close } = useDropdown()

  const dispatch = useDispatch()
  const ingredients = useIngredientString(recipeId)
  const isArchived = useSelector(s => {
    const maybeRecipe = s.recipes.byId[recipeId]
    if (maybeRecipe?.kind === "Success") {
      return Boolean(maybeRecipe.data.archived_at)
    }
    return false
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

  const scheduleUrl = useScheduleUrl(recipeId)

  const exportYamlUrl = `/recipes/${recipeId}.yaml`
  const exportJsonUrl = `/recipes/${recipeId}.json`

  return (
    <DropdownContainer ref={ref}>
      <Button size="small" onClick={toggle}>
        Options <Chevron />
      </Button>
      <DropdownMenu isOpen={isOpen}>
        <DropdownItemLink to={scheduleUrl} onClick={close}>
          Schedule
        </DropdownItemLink>
        <DropdownItemButton onClick={onDuplicate}>
          <span>Duplicate</span>
          {creatingDuplicate && <span>(creating...)</span>}
        </DropdownItemButton>
        <DropdownItemButton onClick={handleCopyIngredients}>
          Copy Ingredients to Clipboard
        </DropdownItemButton>
        <DropdownItemLink isRaw to={exportYamlUrl} onClick={close}>
          Export as YAML
        </DropdownItemLink>
        <DropdownItemLink isRaw to={exportJsonUrl} onClick={close}>
          Export as JSON
        </DropdownItemLink>
        {!isArchived ? (
          <DropdownItemButton onClick={archiveRecipe}>
            Archive Recipe
          </DropdownItemButton>
        ) : (
          <DropdownItemButton onClick={unArchiveRecipe}>
            Unarchive Recipe
          </DropdownItemButton>
        )}
      </DropdownMenu>
    </DropdownContainer>
  )
}
