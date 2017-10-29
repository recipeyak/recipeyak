import React from 'react'

import { units } from './constants'

const emptyField = ({
  quantity,
  unit,
  name,
  description
}) => quantity === '' || unit === '' || name === '' || description === ''

const allEmptyFields = ({
  quantity,
  unit,
  name,
  description
}) => quantity === '' && unit === '' && name === '' && description === ''

class Ingredient extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      quantity: props.quantity || '',
      unit: props.unit || '',
      name: props.name || '',
      description: props.description || '',

      editing: false,
      unsavedChanges: false
    }
  }

  componentWillReceiveProps = nextProps => {
    this.setState({
      quantity: nextProps.quantity,
      unit: nextProps.unit,
      name: nextProps.name,
      description: nextProps.description
    })
  }

  componentWillMount () {
    document.addEventListener('mousedown', this.handleGeneralClick)
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleGeneralClick)
  }

  // ensures that the list item closes when the user clicks outside of the item
  handleGeneralClick = e => {
    const clickedInComponent = this.element && this.element.contains(e.target)
    if (clickedInComponent) return
    this.setState((prevState, props) => {
      const contentChanged =
        prevState.quantity !== props.quantity ||
        prevState.unit !== props.unit ||
        prevState.name !== props.name ||
        prevState.description !== props.description
      return {
        editing: false,
        unsavedChanges: (prevState.editing && contentChanged) || prevState.unsavedChanges
      }
    })
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  enableEditing = () => {
    this.setState({
      editing: true,
      unsavedChanges: false
    })
  }

  discardChanges = () => {
    this.setState((prevState, props) => {
      const {
        quantity,
        unit,
        name,
        description
      } = props

      return {
        editing: false,
        unsavedChanges: false,
        quantity,
        unit,
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
      const {
        quantity,
        unit,
        name,
        description
      } = props

      return {
        editing: false,
        quantity,
        unit,
        name,
        description
      }
    })
  }

  update = e => {
    e.preventDefault()
    if (emptyField(this.state)) return

    e.stopPropagation()

    if (allEmptyFields(this.state)) return this.remove()

    const {
      quantity,
      unit,
      name,
      description
    } = this.state

    this.setState({
      editing: false,
      unsavedChanges: false
    },
      this.props.update(this.props.id,
        {
          quantity,
          unit,
          name,
          description
        }
      )
    )
  }

  remove = () =>
    this.props.remove(this.props.id)

  render () {
    const {
      handleInputChange,
      enableEditing,
      cancel,
      remove,
      discardChanges
    } = this

    const {
      name,
      quantity,
      unit,
      description,
      editing,
      unsavedChanges
    } = this.state

    // TODO: fetch from backend

    const inner = editing
      ? <form onSubmit={ this.update }>

          <div className="field">
            <div className="control">

              <div className="d-flex">

                <input
                  onChange={ handleInputChange }
                  autoFocus
                  onFocus={ e => e.target.select() }
                  value={ quantity }
                  className="my-input input-quantity"
                  type="number"
                  placeholder="3"
                  name="quantity"/>

                <div className="select">
                  <select
                    onChange={ handleInputChange }
                    name='unit'
                    value={unit}>
                    <option disabled value="-1">unit</option>
                    {
                      units.map(x =>
                        <option key={ x } value={ x }>{ x }</option>
                      )
                    }
                  </select>
                </div>

                <input
                  onChange={ handleInputChange }
                  onFocus={ e => e.target.select() }
                  value={ name }
                  className="my-input input-ingredient"
                  type="text"
                  placeholder="tomato"
                  name="name"/>
              </div>

              <input
                onChange={ handleInputChange }
                onFocus={ e => e.target.select() }
                value={ description }
                className="my-input input-ingredient"
                type="text"
                placeholder="diced at 3cm in width"
                name="description"/>

            </div>
          </div>
          <section className="listitem-button-container">
            <div className="field is-grouped">
              <p className="control">
                <input
                  className="button"
                  type="submit"
                  name="update"
                  value="Update"
                />
              </p>
              <p className="control">
                <input
                  onClick={ cancel }
                  className="button"
                  type="button"
                  name="cancel edit"
                  value="✕"
                />
              </p>
            </div>
            <div className="field is-grouped">
              <p className="control">
                <input
                  onClick={ remove }
                  className="button"
                  type="button"
                  name="remove"
                  value="remove"
                />
              </p>
            </div>
          </section>
        </form>
      : <p className="listitem-text">
          { quantity } { unit } { name } { description }
        </p>

    return (
      <li ref={element => { this.element = element }}>
        <section
          className="cursor--pointer"
          onClick={ enableEditing }>
        { inner }
        </section>
        {
          unsavedChanges &&
          <section className="unsaved-changes">
            <span className="is-italic">Unsaved Changes</span>
            <section>
              <a onClick={ enableEditing }
                className="button is-link">
                View Edits
              </a>
              <a onClick={ discardChanges }
                className="button is-link">
                Discard
              </a>
            </section>
          </section>
        }
      </li>
    )
  }
}

export default Ingredient
