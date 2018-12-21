import React from "react"
import PropTypes from "prop-types"

import IngredientView from "./IngredientView"

const emptyField = ({ quantity, name }) => quantity === "" || name === ""

const allEmptyFields = ({ quantity, name, description }) =>
  quantity === "" && name === "" && description === ""

export default class Ingredient extends React.Component {
  constructor(props) {
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

  static propTypes = {
    quantity: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    update: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    recipeID: PropTypes.number.isRequired,
    remove: PropTypes.func.isRequired,
    updating: PropTypes.bool.isRequired,
    optional: PropTypes.bool.isRequired,
    removing: PropTypes.bool.isRequired
  }

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

  componentWillMount() {
    document.addEventListener("mouseup", this.handleGeneralClick)
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.handleGeneralClick)
  }

  // ensures that the list item closes when the user clicks outside of the item
  handleGeneralClick = e => {
    const clickedInComponent = this.element && this.element.contains(e.target)
    if (clickedInComponent) return
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

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
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

  handleFocus = e => {
    e.target.select()
  }

  cancel = e => {
    e.stopPropagation()

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

  update = async e => {
    e.preventDefault()
    if (emptyField(this.state)) return

    e.stopPropagation()

    if (allEmptyFields(this.state)) {
      return this.remove()
    }

    const { quantity, name, description, optional } = this.state

    await this.props.update({
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
      cancel,
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
              <button
                className={
                  "my-button is-small " + (updating ? "is-loading" : "")
                }
                type="submit"
                name="update">
                Update
              </button>
            </p>
            <p className="control">
              <input
                onClick={cancel}
                className="my-button is-small"
                type="button"
                name="cancel edit"
                value="Cancel"
              />
            </p>
          </div>
          <div className="field is-grouped">
            <p className="control">
              <button
                onClick={remove}
                className={
                  "my-button is-small " + (removing ? "is-loading" : "")
                }
                type="button"
                name="remove">
                Remove
              </button>
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
      <li
        ref={element => {
          this.element = element
        }}>
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
