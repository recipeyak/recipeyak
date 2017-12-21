import React from 'react'

const emptyField = ({
  quantity,
  name,
  description
}) => quantity === '' || name === '' || description === ''

const allEmptyFields = ({
  quantity,
  name,
  description
}) => quantity === '' && name === '' && description === ''

class Ingredient extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      quantity: props.quantity || '',
      name: props.name || '',
      description: props.description || '',

      editing: false,
      unsavedChanges: false
    }
  }

  componentWillReceiveProps = nextProps => {
    this.setState({
      quantity: nextProps.quantity,
      name: nextProps.name,
      description: nextProps.description
    })
  }

  componentWillMount () {
    document.addEventListener('mouseup', this.handleGeneralClick)
  }

  componentWillUnmount () {
    document.removeEventListener('mouseup', this.handleGeneralClick)
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
        name,
        description
      } = props

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
      const {
        quantity,
        name,
        description
      } = props

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

    const {
      quantity,
      name,
      description
    } = this.state

    await this.props.update(this.props.id,
      {
        quantity,
        name,
        description
      }
    )

    this.setState({
      editing: false,
      unsavedChanges: false
    })
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
      description,
      editing,
      unsavedChanges
    } = this.state

    const {
      updating,
      removing
    } = this.props

    // TODO: fetch from backend

    const inner = editing
      ? <form onSubmit={ this.update }>

          <div className="field">

            <div className="add-ingredient-grid">

              <input
                onChange={ handleInputChange }
                autoFocus
                onFocus={ e => e.target.select() }
                value={ quantity }
                className="my-input input-quantity"
                type="text"
                placeholder="3 lbs"
                name="quantity"/>

              <input
                onChange={ handleInputChange }
                onFocus={ e => e.target.select() }
                value={ name }
                className="my-input input-ingredient"
                type="text"
                placeholder="tomato"
                name="name"/>

              <input
                onChange={ handleInputChange }
                onFocus={ e => e.target.select() }
                value={ description }
                className="my-input input-ingredient grid-entire-row"
                type="text"
                placeholder="diced at 3cm in width"
                name="description"/>

            </div>
          </div>

          <section className="listitem-button-container">
            <div className="field is-grouped">
              <p className="control">
                <button
                  className={ 'button ' + (updating ? 'is-loading' : '')}
                  type="submit"
                  name="update">
                  Update
                </button>
              </p>
              <p className="control">
                <input
                  onClick={ cancel }
                  className="my-button"
                  type="button"
                  name="cancel edit"
                  value="✕"
                />
              </p>
            </div>
            <div className="field is-grouped">
              <p className="control">
                <button
                  onClick={ remove }
                  className={ 'button ' + (removing ? 'is-loading' : '')}
                  type="button"
                  name="remove">
                  Remove
                </button>
              </p>
            </div>
          </section>
        </form>
      : <p className="listitem-text justify-space-between">
          { quantity } { name } { description }
        </p>

    return (
      <li ref={element => { this.element = element }}>
        <section
          className="cursor-pointer"
          onClick={ enableEditing }>
        { inner }
        </section>
        {
          unsavedChanges &&
          <section className="d-flex justify-space-between align-center">
            <span className="is-italic">Unsaved Changes</span>
            <section>
              <a onClick={ enableEditing }
                className="my-button is-link">
                View Edits
              </a>
              <a onClick={ discardChanges }
                className="my-button is-link">
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
