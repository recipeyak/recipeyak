import React from "react"
import { styled, css } from "@/theme"
import { useSelector, useDispatch, useOnClickOutside } from "@/hooks"
import { LinkProps as RRLinkProps, Link as RRLink } from "react-router-dom"
import { scheduleURLFromTeamID } from "@/store/mapState"
import { copyToClipboard } from "@/clipboard"
import { isSuccessLike } from "@/webdata"
import { showNotificationWithTimeoutAsync } from "@/store/thunks"
import { Chevron } from "@/components/icons"
import { IIngredient, duplicateRecipe, IRecipe } from "@/store/reducers/recipes"
import { Button } from "@/components/Buttons"

const DropdownContainer = styled.div`
  position: relative;
`

interface ILinkProps extends RRLinkProps {
  readonly isRaw?: boolean
  readonly to: string
}

function Link({ to, replace, isRaw, ...rest }: ILinkProps) {
  if (isRaw) {
    return <a href={to} {...rest} />
  }
  return <RRLink to={to} replace={replace} {...rest} />
}

const dropdownItemStyle = css`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0.25rem 0.5rem;
  font-weight: 400;
  color: #212529;
  white-space: nowrap;
  text-align: left;

  :hover {
    color: #16181b;
    text-decoration: none;
  }

  :active {
    background-color: ${p => p.theme.color.primaryShadow};
  }

  cursor: pointer;

  font-family: inherit;
  font-size: inherit;
  line-height: inherit;

  background-color: transparent;
  border: none;
`

const DropdownItemLink = styled(Link)`
  ${dropdownItemStyle}
`

const DropdownItemButton = styled.button`
  ${dropdownItemStyle}
`

const isOpenStyle = css`
  display: block;
`

interface IDropdownMenuProps {
  readonly isOpen: boolean
}

const DropdownMenu = styled.div<IDropdownMenuProps>`
  position: absolute;
  left: auto;
  right: 0;
  z-index: 1000;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 1rem;

  background-color: ${p => p.theme.color.white};
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
  display: none;

  ${p => p.isOpen && isOpenStyle}
`

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
  onComplete
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
  const [isOpen, setIsOpen] = React.useState(false)
  const handleClick = React.useCallback(() => setIsOpen(p => !p), [])
  const closeDropdown = React.useCallback(() => setIsOpen(false), [])

  const dispatch = useDispatch()
  const ingredients = useIngredientString(recipeId)

  const [creatingDuplicate, onDuplicate] = useDuplicateRecipe({
    recipeId,
    onComplete: closeDropdown
  })

  const handleCopyIngredients = React.useCallback(() => {
    copyToClipboard(ingredients)
    showNotificationWithTimeoutAsync(dispatch)({
      message: "Copied ingredients to clipboard!",
      level: "info"
    })
    closeDropdown()
  }, [closeDropdown, dispatch, ingredients])

  const ref = useOnClickOutside<HTMLDivElement>(closeDropdown)

  const scheduleUrl = useScheduleUrl(recipeId)

  const exportYamlUrl = `/recipes/${recipeId}.yaml`
  const exportJsonUrl = `/recipes/${recipeId}.json`

  return (
    <DropdownContainer ref={ref}>
      <Button size="small" onClick={handleClick}>
        Options <Chevron />
      </Button>
      <DropdownMenu isOpen={isOpen}>
        <DropdownItemLink to={scheduleUrl} onClick={closeDropdown}>
          Schedule
        </DropdownItemLink>
        <DropdownItemButton onClick={onDuplicate}>
          <span>Duplicate</span>
          {creatingDuplicate && <span>(creating...)</span>}
        </DropdownItemButton>
        <DropdownItemButton onClick={handleCopyIngredients}>
          Copy Ingredients to Clipboard
        </DropdownItemButton>
        <DropdownItemLink isRaw to={exportYamlUrl} onClick={closeDropdown}>
          Export as YAML
        </DropdownItemLink>
        <DropdownItemLink isRaw to={exportJsonUrl} onClick={closeDropdown}>
          Export as JSON
        </DropdownItemLink>
      </DropdownMenu>
    </DropdownContainer>
  )
}
