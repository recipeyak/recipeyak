import React from "react"

import IngredientView from "@/components/IngredientView"
import { IIngredient, IRecipe } from "@/store/reducers/recipes"
import GlobalEvent from "@/components/GlobalEvent"
import { Button } from "./Buttons"

interface IEmptyField {
  readonly quantity?: string
  readonly name?: string
}

const emptyField = ({ quantity, name }: IEmptyField) =>
  quantity === "" || name === ""

interface IAllEmptyFields {
  readonly quantity?: string
  readonly name?: string
  readonly description?: string
}
const allEmptyFields = ({ quantity, name, description }: IAllEmptyFields) =>
  quantity === "" && name === "" && description === ""

interface IIngredientProps {
  readonly quantity: IIngredient["quantity"]
  readonly name: IIngredient["name"]
  readonly description: IIngredient["description"]
  readonly optional: IIngredient["optional"]
  readonly recipeID: IRecipe["id"]
  readonly id: IIngredient["id"]
  readonly updating?: boolean
  readonly removing?: boolean
  readonly remove: (recipeID: IRecipe["id"], id: IIngredient["id"]) => void
  readonly update: (
    {
      quantity,
      name,
      description,
      optional
    }: Pick<IIngredient, "quantity" | "name" | "description" | "optional">
  ) => void
}

interface IIngredientState {
  readonly quantity: IIngredient["quantity"]
  readonly name: IIngredient["name"]
  readonly description: IIngredient["description"]
  readonly optional: IIngredient["optional"]
  readonly editing: boolean
  readonly unsavedChanges: boolean
}

export default class Ingredient extends React.Component<
  IIngredientProps,
  IIngredientState
> {
  constructor(props: IIngredientProps) {
    super(props)
    this.state = {
      quantity: props.quantity,
      name: props.name,
      description: props.description,
      optional: props.optional,

      editing: false,
      unsavedChanges: false
    }
  }

  element = React.createRef<HTMLLIElement>()

  static defaultProps = {
    // need default recipeID for when we use this in the Add Recipe page
    recipeID: -1,
    quantity: "",
    name: "",
    description: "",
    optional: false,
    updating: false,
    removing: false
  }

  // ensures that the list item closes when the user clicks outside of the item
  handleGeneralClick = (e: MouseEvent) => {
    const el = this.element.current
    const target = e.target as HTMLElement | null
    if (el == null || target == null) {
      return
    }
    const clickedInComponent = el.contains(target)
    if (clickedInComponent) {
      return
    }
    this.setState((prevState, props) => {
      const contentChanged =
        prevState.quantity !== props.quantity ||
        prevState.name !== props.name ||
        prevState.description !== props.description
      return {
        editing: false,
        unsavedChanges:
          (prevState.editing && contentChanged) || prevState.unsavedChanges
      }
    })
  }

  handleGeneralKeyup = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.cancel()
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(({
      [e.target.name]: e.target.value
    } as unknown) as IIngredientState)
  }

  toggleOptional = () => {
    this.setState(prev => ({ optional: !prev.optional }))
  }

  enableEditing = () => {
    this.setState({
      editing: true,
      unsavedChanges: false
    })
  }

  discardChanges = () => {
    this.setState((_, props) => {
      const { quantity, name, description } = props

      return {
        editing: false,
        unsavedChanges: false,
        quantity,
        name,
        description
      }
    })
  }

  handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  cancel = () => {
    // Restore state to match props
    this.setState((_, props) => {
      const { quantity, name, description } = props
      return {
        editing: false,
        quantity,
        name,
        description
      }
    })
  }

  handleCancelButton = (e: React.MouseEvent) => {
    e.stopPropagation()
    this.cancel()
  }

  update = async (e: React.FormEvent) => {
    e.preventDefault()
    if (emptyField(this.state)) {
      return
    }

    e.stopPropagation()

    if (allEmptyFields(this.state)) {
      return this.remove()
    }

    const { quantity, name, description, optional } = this.state

    this.props.update({
      quantity,
      name,
      description,
      optional
    })

    this.setState({
      editing: false,
      unsavedChanges: false
    })
  }

  remove = () => this.props.remove(this.props.recipeID, this.props.id)

  render() {
    const {
      handleInputChange,
      enableEditing,
      handleCancelButton,
      remove,
      discardChanges,
      update
    } = this

    const {
      name,
      quantity,
      description,
      optional,
      editing,
      unsavedChanges
    } = this.state

    const { updating, removing } = this.props

    const inner = editing ? (
      <form onSubmit={update}>
        <GlobalEvent
          mouseUp={this.handleGeneralClick}
          keyUp={this.handleGeneralKeyup}
        />
        <div className="field">
          <div className="add-ingredient-grid">
            <input
              onChange={handleInputChange}
              autoFocus
              onFocus={e => e.target.select()}
              value={quantity}
              className="my-input input-quantity"
              type="text"
              placeholder="3 lbs"
              name="quantity"
            />

            <input
              onChange={handleInputChange}
              onFocus={e => e.target.select()}
              value={name}
              className="my-input input-ingredient"
              type="text"
              placeholder="tomato"
              name="name"
            />

            <input
              onChange={handleInputChange}
              onFocus={e => e.target.select()}
              value={description}
              className="my-input input-ingredient grid-entire-row"
              type="text"
              placeholder="diced at 3cm in width"
              name="description"
            />
          </div>
        </div>

        <label className="d-flex align-items-center cursor-pointer mb-2">
          <input
            onChange={this.toggleOptional}
            checked={optional}
            name="optional"
            type="checkbox"
            className="mr-2"
          />
          Optional
        </label>

        <section className="listitem-button-container">
          <div className="field is-grouped">
            <p className="control">
              <Button
                size="small"
                type="submit"
                name="update"
                loading={updating}>
                Update
              </Button>
            </p>
            <p className="control">
              <Button
                onClick={handleCancelButton}
                size="small"
                type="reset"
                name="cancel edit">
                Cancel
              </Button>
            </p>
          </div>
          <div className="field is-grouped">
            <p className="control">
              <Button
                onClick={remove}
                size="small"
                loading={removing}
                name="remove">
                Remove
              </Button>
            </p>
          </div>
        </section>
      </form>
    ) : (
      <IngredientView
        quantity={quantity}
        name={name}
        description={description}
        optional={this.state.optional}
      />
    )

    return (
      <li ref={this.element}>
        <section className="cursor-pointer" onClick={enableEditing}>
          {inner}
        </section>
        {unsavedChanges && (
          <section className="d-flex justify-space-between align-center">
            <span className="is-italic fs-4">Unsaved Changes</span>
            <section>
              <a onClick={enableEditing} className="my-button is-small is-link">
                View Edits
              </a>
              <a
                onClick={discardChanges}
                className="my-button is-small is-link">
                Discard
              </a>
            </section>
          </section>
        )}
      </li>
    )
  }
}
