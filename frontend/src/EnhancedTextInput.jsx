import React from 'react'
import PropTypes from 'prop-types'

class EnhancedTextInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: props.text,
      editing: false,
      unsavedChanges: false,
    }

    document.addEventListener('mousedown', (e) => this.handleGeneralClick(e))
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', (e) => this.handleGeneralClick(e))
  }

  handleGeneralClick (e) {
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

  handleFocus (e) {
    e.target.select()
  }

  enableEditing () {
    this.setState({ editing: true })
  }

  handleInputChange (e) {
    this.setState({ text: e.target.value })
  }

  discardChanges () {
    this.setState((_, props) => ({
      text: props.text,
      unsavedChanges: false,
      editing: false,
    }))
  }

  update () {
    this.props.onChange(this.state.text)
    this.setState({ editing: false })
  }

  render () {
    const { text, editing } = this.state
    const { name } = this.props

    const TextInput =
      <form onSubmit={ (e) => {
        e.preventDefault()
        if (text === '') return
        this.update()
      }}>

        <input
          onChange={ e => this.handleInputChange(e) }
          defaultValue={ text }
          onFocus={ e => this.handleFocus(e) }
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
                onClick={ e => this.discardChanges(e) }
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
            <a onClick={() => this.enableEditing() }
              className="button is-link">
              View Edits
            </a>
            <a onClick={() => this.discardChanges() }
              className="button is-link">
              Discard
            </a>
          </section>
        </section>

    return (
      <section ref="input">
        { !editing
            ? <section>
                <h2
                  onClick={ () => this.enableEditing() }
                  className="input-author">
                  { text }
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
  className: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

EnhancedTextInput.defaultProps = {
  placeholder: 'input text',
}

export default EnhancedTextInput
