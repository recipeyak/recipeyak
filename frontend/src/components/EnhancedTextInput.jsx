import React from 'react'
import PropTypes from 'prop-types'

import './EnhancedTextInput.scss'

class EnhancedTextInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: props.text,
      editing: false,
      unsavedChanges: false,
    }

    document.addEventListener('mousedown', this.handleGeneralClick)
  }

  // since we initialize the state with the props, and in turn use this.state
  // as our source of truth, we need to overwrite this.state on prop change
  componentWillReceiveProps = nextProps => {
    this.setState({ text: nextProps.text })
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleGeneralClick)
  }

  handleGeneralClick = e => {
    e.stopPropagation()
    const el = this.refs.input
    if (el == null) return
    const clickOnListItem = el.contains(e.srcElement)
    if (!clickOnListItem) {
      this.setState((prevState, props) => ({
        editing: false,
        unsavedChanges: (prevState.editing && prevState.text !== props.text) || prevState.unsavedChanges,
      }))
    }
  }

  handleFocus = e => {
    e.target.select()
  }

  enableEditing = () => {
    this.setState({ editing: true })
  }

  handleInputChange = e => {
    this.setState({ text: e.target.value })
  }

  discardChanges = () => {
    this.setState((_, props) => ({
      text: props.text,
      unsavedChanges: false,
      editing: false,
    }))
  }

  handleSubmit = e => {
    e.preventDefault()
    if (this.state.text === '') return
    this.props.onChange(this.state.text)
    this.setState({ editing: false })
  }

  render () {
    const TextInput =
      <form className="width-100" onSubmit={ this.handleSubmit }>

        <input
          onChange={ this.handleInputChange }
          defaultValue={ this.state.text }
          onFocus={ this.handleFocus }
          autoFocus
          className={ 'input ' + (this.props.className != null && this.props.className) }
          type="text"
          placeholder={ this.props.placeholder }
          name={ name }/>

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
                onClick={ this.discardChanges }
                className="button"
                type="button"
                name="cancel edit"
                value="✕"
              />
            </p>
          </div>
        </section>
      </form>

    const unsavedChanges =
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

    return (
      <section ref="input" className="flex-grow">
        { !this.state.editing
            ? <section>
                <h2
                  onClick={ this.enableEditing }
                  className={ this.props.className }>
                  { this.state.text }
                </h2>
                { unsavedChanges }
              </section>
            : TextInput
        }
      </section>
    )
  }
}

EnhancedTextInput.PropTypes = {
  text: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}

EnhancedTextInput.defaultProps = {
  placeholder: 'input text',
  className: '',
}

export default EnhancedTextInput
