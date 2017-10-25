import React from 'react'
import PropTypes from 'prop-types'

import './Ingredient.scss'

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
    this.setState((prevState, props) => ({
      editing: false,
      unsavedChanges: (prevState.editing && prevState.text !== props.text) || prevState.unsavedChanges
    }))
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
    this.setState((prevState, props) => ({
      editing: false,
      text: props.text,
      unsavedChanges: false
    }))
  }

  handleFocus = e => {
    e.target.select()
  }

  cancel = e => {
    e.stopPropagation()
    this.setState((prevState, props) => ({
      editing: false,
      text: props.text
    }))
  }

  update = e => {
    e.stopPropagation()
    this.setState({
      editing: false,
      unsavedChanges: false
    })
    // if the text is empty, we should just delete the item instead of updating
    if (this.state.text === '') {
      this.delete()
    } else {
      this.props.update(this.props.id, this.state.text)
    }
  }

  delete = () =>
    this.props.delete(this.props.id)

  render () {
    const inner = this.state.editing
      ? <form onSubmit={
          (e) => {
            e.preventDefault()
            if (this.state.text === '') return
            this.add()
          }
        }>

          <div className="field">
            <div className="control">
              <textarea
                autoFocus
                onFocus={ this.handleFocus }
                onChange={ this.handleInputChange }
                onKeyPress={ (e) => {
                  if (this.state.text === '') return
                  if (e.shiftKey && e.key === 'Enter') {
                    e.preventDefault()
                    this.add()
                  }
                }}
                defaultValue={ this.state.text }
                className="textarea"
                placeholder="Add you text here"
                name="text"/>
            </div>
          </div>
          <section className="listitem-button-container">
            <div className="field is-grouped">
              <p className="control">
                <input
                  onClick={ this.update }
                  className="button"
                  type="button"
                  name="save"
                  value="Save"
                />
              </p>
              <p className="control">
                <input
                  onClick={ this.cancel }
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
                  onClick={ this.delete }
                  className="button"
                  type="button"
                  name="delete"
                  value="delete"
                />
              </p>
            </div>
          </section>
        </form>
      : <p className="listitem-text">
          { this.state.text }
        </p>

    return (
      <li ref={element => { this.element = element }}>
        <section
          className="cursor--pointer"
          onClick={this.enableEditing}>
        { inner }
        </section>
        {
          this.state.unsavedChanges &&
          <section className="unsaved-changes">
            <span className="is-italic">Unsaved Changes</span>
            <section>
              <a onClick={ this.enableEditing }
                className="button is-link">
                View Edits
              </a>
              <a onClick={ this.discardChanges }
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

Ingredient.PropTypes = {
  text: PropTypes.string,
  id: PropTypes.number,
  delete: PropTypes.func,
  update: PropTypes.func
}

export default Ingredient
