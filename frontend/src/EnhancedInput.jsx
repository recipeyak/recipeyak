import React from 'react'
import PropTypes from 'prop-types'

class EnhancedInput extends React.Component {
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
    // this.props.onChange(e)
    console.log(e.target.name, e.target.value)
  }

  discardChanges () {
    this.setState((_, props) => ({
      text: props.text,
      unsavedChanges: false,
      editing: false,
    }))
  }

  update (e) {
    this.props.onChange(e)
    this.setState({ editing: false })
  }

  render () {
    const { text, editing } = this.state
    const { name } = this.props

    const TextInput =
      <section>
          <input
            onChange={ e => this.handleInputChange(e) }
            defaultValue={ text }
            onFocus={ e => this.handleFocus(e) }
            autoFocus
            className="input input-title"
            type="text"
            placeholder={ 'add text' }
            name={ name }/>

          <section className="listitem-button-container">
            <div className="field is-grouped">
              <p className="control">
                <input
                  onClick={ e => this.update(e) }
                  className="button"
                  type="button"
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
        </section>

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
                <h1
                  onClick={ () => this.enableEditing() }
                  className="input-title">
                  { text }
                </h1>
                { unsavedChanges }
              </section>
            : TextInput
        }
      </section>
    )
  }
}

EnhancedInput.PropTypes = {
  text: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default EnhancedInput
