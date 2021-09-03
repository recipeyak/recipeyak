import React from "react"
import uniq from "lodash/uniq"
import { Button } from "@/components/Buttons"
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
  readonly newTag: string
}

class RecipeTitle extends React.Component<
  IRecipeTitleProps,
  IRecipeTitleState
> {
  state: IRecipeTitleState = {
    show: false,
    recipe: {},
    newTag: "",
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
    this.setState(prevState => ({
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

  handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTag: e.target.value })
  }

  handleNewTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") {
      return
    }
    e.persist()
    this.setState(prevState => ({
      recipe: {
        ...prevState.recipe,
        tags: uniq([...(prevState.recipe.tags ?? []), prevState.newTag]),
      },
      newTag: "",
    }))
  }
  removeTag = (tag: string) => {
    this.setState(prevState => ({
      ...prevState,
      recipe: {
        ...prevState.recipe,
        tags: prevState.recipe.tags?.filter(x => x !== tag),
      },
    }))
  }

  render() {
    const {
      id,
      name,
      author,
      source,
      servings,
      tags,
      time,
      owner,
      updating,
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
            <div className="d-flex mt-2">
              <label className="d-flex align-center">tags</label>
              <div className="ml-2 d-flex align-center">
                {this.state.recipe.tags?.map(x => (
                  <span className="tag">
                    {x}{" "}
                    <button
                      className="delete is-small"
                      onClick={() => this.removeTag(x)}
                    />
                  </span>
                ))}
              </div>
              <TextInput
                className="ml-2 max-width-200px"
                placeholder="new tag"
                value={this.state.newTag}
                onChange={this.handleNewTagChange}
                onKeyDown={this.handleNewTag}
              />
            </div>

            <div className="d-flex grid-entire-row align-items-end justify-content-end">
              <Button
                size="small"
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
