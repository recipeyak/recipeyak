import React from 'react'

import './ListItem.scss'

class ListItem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      originalText: props.text,
      text: props.text || '',
      editing: false,
      index: props.index,
    }

    document.addEventListener('mousedown', (e) => this.handleGeneralClick(e))
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', (e) => this.handleGeneralClick(e))
  }

  // ensures that the list item closes when the user clicks outside of the item
  handleGeneralClick (e) {
    const el = this.refs.listitem
    if (el == null) return
    const clickOnListItem = el.contains(e.srcElement)
    if (!clickOnListItem) {
      this.setState({ editing: false })
    }
    // TODO: should we say unsaved changes or should we just save the changes?
  }

  handleInputChange (e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  enableEditing () {
    this.setState({ editing: true })
  }

  handleFocus (event) {
    event.target.select()
  }

  addStep () {
    console.log(this.state)
    // TODO: update store
  }

  cancelAddStep () {
    this.setState(prevState => ({
      editing: false,
      text: prevState.originalText,
    }), () => console.log(this.state))
  }

  updateStep () {
    this.setState({ editing: false })
    this.props.updateStep(this.state.text)
  }

  deleteStep (index) {
    this.props.deleteStep(index)
  }

  render () {
    const inner = this.state.editing
      ? <form onSubmit={
          (e) => {
            e.preventDefault()
            if (this.state.text === '') return
            this.addStep()
          }
        }>

          <div className="field">
            <div className="control">
              <textarea
                autoFocus
                onFocus={ (e) => this.handleFocus(e) }
                onChange={ (e) => this.handleInputChange(e) }
                onKeyPress={ (e) => {
                  if (this.state.text === '') return
                  if (e.shiftKey && e.key === 'Enter') {
                    e.preventDefault()
                    this.addStep()
                  }
                }}
                defaultValue={ this.state.text }
                className="textarea"
                placeholder="Add your step here"
                name="step"/>
            </div>
          </div>
          <section className="listitem-button-container">
            <div className="field is-grouped">
              <p className="control">
                <input
                  onClick={ () => this.updateStep() }
                  disabled={ this.state.text === '' }
                  className={ this.state.text === '' ? 'is-hidden button' : 'button' }
                  type="button"
                  name="save"
                  value="Save"
                />
              </p>
              <p className="control">
                <input
                  onClick={ () => this.cancelAddStep() }
                  disabled={ this.state.text === '' }
                  className={ this.state.text === '' ? 'is-hidden button' : 'button' }
                  type="button"
                  name="cancel step"
                  value="✕"
                />
              </p>
            </div>
            <div className="field is-grouped">
              <p className="control">
                <input
                  onClick={ () => this.deleteStep(this.state.index) }
                  disabled={ this.state.text === '' }
                  className={ this.state.text === '' ? 'is-hidden button' : 'button' }
                  type="button"
                  name="delete step"
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
      <li
        onClick={() => this.enableEditing()}
        ref="listitem"
        className="cursor--pointer"
      >
        <label className="label">Step { this.state.index + 1}</label>
        { inner }
      </li>
    )
  }
}

export default ListItem
