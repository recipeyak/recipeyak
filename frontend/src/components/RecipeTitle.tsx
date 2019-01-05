import React from "react"
import { Button, ButtonPrimary } from "@/components/Buttons"
import MetaData from "@/components/MetaData"
import DatePickerForm from "@/components/DatePickerForm"
import { IRecipe } from "@/store/reducers/recipes"
import GlobalEvent from "@/components/GlobalEvent"
import { TextInput } from "@/components/Forms"

interface IRecipeTitleProps {
  readonly id: IRecipe["id"]
  readonly name: IRecipe["name"]
  readonly author: IRecipe["author"]
  readonly source: IRecipe["source"]
  readonly servings: IRecipe["servings"]
  readonly time: IRecipe["time"]
  readonly owner: IRecipe["owner"]
  readonly update: (id: IRecipe["id"], recipe: IRecipeBasic) => Promise<void>
  readonly updating?: boolean
  readonly remove: (id: IRecipe["id"]) => void
  readonly deleting?: boolean
  readonly lastScheduled?: string
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
  readonly edit: boolean
  readonly recipe: IRecipeBasic
}

export default class RecipeTitle extends React.Component<
  IRecipeTitleProps,
  IRecipeTitleState
> {
  state: IRecipeTitleState = {
    show: false,
    edit: false,
    recipe: {}
  }

  toggleEdit = () => this.setState(prev => ({ edit: !prev.edit }))

  handleSave = () => {
    const data = this.state.recipe
    if (data == null) {
      return
    }
    this.props.update(this.props.id, data).then(() => {
      this.setState({ edit: false })
    })
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
    if (!this.state.edit) {
      return
    }
    if (e.key === "Escape") {
      this.toggleEdit()
    }
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
      deleting,
      lastScheduled
    } = this.props
    const toolTip = lastScheduled
      ? "last scheduled: " + lastScheduled
      : "never scheduled"
    return (
      <div>
        <div className="grid-entire-row d-flex justify-space-between p-rel">
          <GlobalEvent keyUp={this.handleGlobalKeyUp} />
          {!this.state.edit ? (
            <div className="d-flex align-items-center">
              <h1
                className="title fs-2rem mb-0 cursor-pointer mb-1"
                onClick={this.toggleEdit}>
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
          <div>
            <div className="p-rel ml-4" title={toolTip}>
              <ButtonPrimary
                size="small"
                onClick={() => this.setState(prev => ({ show: !prev.show }))}>
                schedule
              </ButtonPrimary>
              <DatePickerForm
                recipeID={id}
                show={this.state.show}
                close={() => this.setState({ show: false })}
              />
            </div>
          </div>
        </div>

        {!this.state.edit ? (
          <div className="grid-entire-row">
            <MetaData
              onClick={this.toggleEdit}
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
