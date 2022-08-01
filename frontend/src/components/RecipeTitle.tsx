import React from "react"
import uniq from "lodash/uniq"
import { Button, ButtonPrimary } from "@/components/Buttons"
import MetaData from "@/components/MetaData"
import {
  IRecipe,
  updateRecipe,
  toggleEditingRecipe,
} from "@/store/reducers/recipes"
import GlobalEvent from "@/components/GlobalEvent"
import { TextInput } from "@/components/Forms"
import { hasSelection } from "@/utils/general"
import { connect } from "react-redux"
import { Dropdown } from "@/components/RecipeTitleDropdown"
import Owner from "@/components/Owner"
import cls from "@/classnames"

function TagEditor({
  tags,
  onRemove,
  onCreate,

  className,
}: {
  readonly tags: string[] | undefined
  readonly onRemove: (_: string) => void
  readonly onCreate: (_: string) => void
  readonly className?: string
}) {
  const [newTag, setNewTag] = React.useState("")
  function handleNewTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") {
      return
    }

    onCreate(newTag)
    setNewTag("")
  }
  return (
    <div className={cls("d-flex mt-2", className)}>
      <label className="d-flex align-center">tags</label>
      <div className="ml-2 d-flex align-center">
        {tags?.map((x) => (
          <span className="tag" key={x}>
            {x}{" "}
            <button className="delete is-small" onClick={() => onRemove(x)} />
          </span>
        ))}
      </div>
      <TextInput
        className="ml-2 max-width-200px"
        placeholder="new tag"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={handleNewTag}
      />
    </div>
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
  readonly tags: IRecipe["tags"]
  readonly update: (args: { id: IRecipe["id"]; data: IRecipeBasic }) => void
  readonly updating?: boolean
  readonly editing?: boolean
  readonly toggleEditing: (recipeID: IRecipe["id"]) => void
}

export interface IRecipeBasic {
  readonly author?: string
  readonly name?: string
  readonly source?: string
  readonly servings?: string
  readonly time?: string
  readonly tags?: string[]
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
    recipe: {},
  }

  componentDidMount() {
    this.setState({ recipe: { tags: this.props.tags } })
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
    this.setState((prevState) => ({
      recipe: {
        ...prevState.recipe,
        [e.target.name]: e.target.value,
      },
    }))
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

  handleNewTag = (tag: string) => {
    this.setState((prevState) => ({
      recipe: {
        ...prevState.recipe,
        tags: uniq([...(prevState.recipe.tags ?? []), tag]),
      },
    }))
  }
  removeTag = (tag: string) => {
    this.setState((prevState) => ({
      ...prevState,
      recipe: {
        ...prevState.recipe,
        tags: prevState.recipe.tags?.filter((x) => x !== tag),
      },
    }))
  }

  render() {
    const { id, name, author, source, servings, tags, time, owner, updating } =
      this.props

    const ownerName = owner.type === "team" ? owner.name : "you"
    return (
      <div>
        <div className="grid-entire-row d-flex justify-space-between p-rel">
          <GlobalEvent keyUp={this.handleGlobalKeyUp} />
          {!this.props.editing ? (
            <div className="d-flex align-items-center">
              <h1
                className="title fs-2rem mb-0 mb-1 cursor-pointer"
                title="click to edit"
                onClick={this.handleEnableEdit}
              >
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
              author={author}
              source={source}
              servings={servings}
              time={time}
              tags={tags}
            />
          </div>
        ) : (
          <div className="">
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

            <div className="d-flex align-center">
              <TagEditor
                tags={this.state.recipe.tags}
                onCreate={this.handleNewTag}
                onRemove={this.removeTag}
                className="mr-2"
              />

              <Owner id={owner.id} name={ownerName} recipeId={id} />
            </div>

            <div className="d-flex grid-entire-row align-items-end justify-content-end">
              <Button
                size="small"
                className="mr-3"
                type="button"
                name="cancel recipe update"
                onClick={this.toggleEdit}
              >
                Cancel
              </Button>
              <ButtonPrimary
                size="small"
                type="submit"
                loading={updating}
                onClick={this.handleSave}
                name="save recipe"
              >
                Save
              </ButtonPrimary>
            </div>
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = {
  update: updateRecipe.request,
  toggleEditing: toggleEditingRecipe,
}

export default connect(null, mapDispatchToProps)(RecipeTitle)
