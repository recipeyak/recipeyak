import React from "react"
import { Button } from "@/components/Buttons"
import MetaData from "@/components/MetaData"
import {
  IRecipe,
  updateRecipe,
  deleteRecipe,
  toggleEditingRecipe,
  IIngredient
} from "@/store/reducers/recipes"
import GlobalEvent from "@/components/GlobalEvent"
import { TextInput } from "@/components/Forms"
import { hasSelection } from "@/utils/general"
import { connect } from "react-redux"
import { styled, css } from "@/theme"
import { useSelector, useDispatch, useOnClickOutside } from "@/hooks"
import { LinkProps as RRLinkProps, Link as RRLink } from "react-router-dom"
import { scheduleURLFromTeamID } from "@/store/mapState"
import { copyToClipboard } from "@/clipboard"
import { isSuccessLike } from "@/webdata"
import { showNotificationWithTimeoutAsync } from "@/store/thunks"
import { Chevron } from "@/components/icons"

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
  display: block;
  width: 100%;
  padding: 0.25rem 0.5rem;
  font-weight: 400;
  color: #212529;
  white-space: nowrap;

  :hover {
    color: #16181b;
    text-decoration: none;
    background-color: ${p => p.theme.color.light};
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

interface IDropdownProps {
  readonly recipeId: number
}
function Dropdown({ recipeId }: IDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClick = React.useCallback(() => setIsOpen(p => !p), [])
  const closeDropdown = React.useCallback(() => setIsOpen(false), [])

  const ingredients = useIngredientString(recipeId)
  const dispatch = useDispatch()

  const handleCopyIngredients = React.useCallback(() => {
    copyToClipboard(ingredients)
    showNotificationWithTimeoutAsync(dispatch)({
      message: "Copied ingredients to clipboard!",
      level: "info"
    })
    closeDropdown()
  }, [closeDropdown, dispatch, ingredients])

  // TODO(sbdchd): can the ref be created inside the `useOnClickOutside`?
  const ref = React.useRef<HTMLDivElement | null>(null)
  useOnClickOutside(ref, closeDropdown)

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

interface IRecipeTitleProps {
  readonly id: IRecipe["id"]
  readonly name: IRecipe["name"]
  readonly author: IRecipe["author"]
  readonly source: IRecipe["source"]
  readonly servings: IRecipe["servings"]
  readonly time: IRecipe["time"]
  readonly owner: IRecipe["owner"]
  readonly update: (args: { id: IRecipe["id"]; data: IRecipeBasic }) => void
  readonly updating?: boolean
  readonly remove: (id: IRecipe["id"]) => void
  readonly deleting?: boolean
  readonly editing?: boolean
  readonly toggleEditing: (recipeID: IRecipe["id"]) => void
}

export interface IRecipeBasic {
  readonly author?: string
  readonly name?: string
  readonly source?: string
  readonly servings?: string
  readonly time?: string
}

interface IRecipeTitleState {
  readonly show: boolean
  readonly recipe: IRecipeBasic
}

class RecipeTitle extends React.Component<
  IRecipeTitleProps,
  IRecipeTitleState
> {
  state: IRecipeTitleState = {
    show: false,
    recipe: {}
  }

  toggleEdit = () => this.props.toggleEditing(this.props.id)

  handleSave = () => {
    const data = this.state.recipe
    if (data == null) {
      return
    }
    this.props.update({ id: this.props.id, data })
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist()
    this.setState(prevState => ({
      recipe: {
        ...prevState.recipe,
        [e.target.name]: e.target.value
      }
    }))
  }

  handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete this recipe "${this.props.name}"?`
      )
    ) {
      this.props.remove(this.props.id)
    }
  }

  handleGlobalKeyUp = (e: KeyboardEvent) => {
    // Pass if we aren't editing
    if (!this.props.editing) {
      return
    }
    if (e.key === "Escape") {
      this.toggleEdit()
    }
  }

  handleEnableEdit = () => {
    if (hasSelection()) {
      return
    }
    this.toggleEdit()
  }

  render() {
    const {
      id,
      name,
      author,
      source,
      servings,
      time,
      owner,
      updating,
      deleting
    } = this.props
    return (
      <div>
        <div className="grid-entire-row d-flex justify-space-between p-rel">
          <GlobalEvent keyUp={this.handleGlobalKeyUp} />
          {!this.props.editing ? (
            <div className="d-flex align-items-center">
              <h1
                className="title fs-2rem mb-0 mb-1 cursor-pointer"
                title="click to edit"
                onClick={this.handleEnableEdit}>
                {name}
              </h1>
            </div>
          ) : (
            <TextInput
              className="fs-2rem mb-4"
              autoFocus
              placeholder="new recipe title"
              onChange={this.handleInputChange}
              defaultValue={name}
              name="name"
            />
          )}
          <Dropdown recipeId={id} />
        </div>

        {!this.props.editing ? (
          <div className="grid-entire-row">
            <MetaData
              title="click to edit"
              onClick={this.handleEnableEdit}
              owner={owner}
              author={author}
              source={source}
              servings={servings}
              recipeId={id}
              time={time}
            />
          </div>
        ) : (
          <div className="d-grid grid-entire-row align-items-center meta-data-grid">
            <div className="d-grid grid-entire-row align-items-center meta-data-grid">
              <label className="d-flex align-center">
                By
                <TextInput
                  className="ml-2"
                  placeholder="Author"
                  defaultValue={author}
                  onChange={this.handleInputChange}
                  name="author"
                />
              </label>
              <label className="d-flex align-center">
                from
                <TextInput
                  className="ml-2"
                  placeholder="http://example.com/dumpling-soup"
                  defaultValue={source}
                  onChange={this.handleInputChange}
                  name="source"
                />
              </label>
              <label className="d-flex align-center">
                creating
                <TextInput
                  className="ml-2"
                  placeholder="4 to 6 servings"
                  defaultValue={servings}
                  onChange={this.handleInputChange}
                  name="servings"
                />
              </label>
              <label className="d-flex align-center">
                in
                <TextInput
                  className="ml-2"
                  placeholder="1 hour"
                  defaultValue={time}
                  onChange={this.handleInputChange}
                  name="time"
                />
              </label>
            </div>
            <div className="d-flex grid-entire-row align-items-center justify-space-between">
              <Button
                size="small"
                type="submit"
                loading={deleting}
                onClick={this.handleDelete}
                name="delete recipe">
                Delete
              </Button>
              <div>
                <Button
                  size="small"
                  className="ml-2"
                  type="submit"
                  loading={updating}
                  onClick={this.handleSave}
                  name="save recipe">
                  Save
                </Button>
                <Button
                  size="small"
                  className="ml-2"
                  type="button"
                  name="cancel recipe update"
                  onClick={this.toggleEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = {
  update: updateRecipe.request,
  remove: deleteRecipe.request,
  toggleEditing: toggleEditingRecipe
}

export default connect(
  null,
  mapDispatchToProps
)(RecipeTitle)
