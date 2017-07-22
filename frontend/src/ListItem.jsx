import React from 'react'
import PropTypes from 'prop-types'

import './ListItem.scss'

class ListItem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: props.text || '',
      editing: false,
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

  cancelAddStep (e) {
    e.stopPropagation()
    this.setState((prevState, props) => ({
      editing: false,
      text: props.text,
    }))
  }

  updateStep (e) {
    e.stopPropagation()
    this.setState({ editing: false })
    // if the text is empty, we should just delete the step instead of updating
    if (this.state.text === '') {
      this.props.deleteStep(this.props.index)
    } else {
      this.props.updateStep(this.props.index, this.state.text)
    }
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
                name="text"/>
            </div>
          </div>
          <section className="listitem-button-container">
            <div className="field is-grouped">
              <p className="control">
                <input
                  onClick={ e => this.updateStep(e) }
                  className="button"
                  type="button"
                  name="save"
                  value="Save"
                />
              </p>
              <p className="control">
                <input
                  onClick={ e => this.cancelAddStep(e) }
                  className="button"
                  type="button"
                  name="cancel step"
                  value="✕"
                />
              </p>
            </div>
            <div className="field is-grouped">
              <p className="control">
                <input
                  onClick={ () => this.deleteStep(this.props.index) }
                  className="button"
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
        <label className="label">Step { this.props.index + 1}</label>
        { inner }
      </li>
    )
  }
}

ListItem.PropTypes = {
  text: PropTypes.string,
  index: PropTypes.number,
}

export default ListItem
