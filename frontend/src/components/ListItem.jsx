import React from 'react'
import PropTypes from 'prop-types'
import Textarea from 'react-textarea-autosize'

export default class ListItem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: props.text || '',
      editing: false,
      unsavedChanges: false
    }
  }

  static propTypes = {
    id: PropTypes.number.isRequired,
    recipeID: PropTypes.number.isRequired,
    delete: PropTypes.func.isRequired,
    removing: PropTypes.bool.isRequired,
    update: PropTypes.func.isRequired,
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
    this.setState((prevState, { text }) => ({
      editing: false,
      unsavedChanges: (prevState.editing && prevState.text !== text) || prevState.unsavedChanges
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
    this.setState((_, { text }) => ({
      editing: false,
      text,
      unsavedChanges: false
    }))
  }

  handleFocus = e => {
    e.target.select()
  }

  cancel = e => {
    e.stopPropagation()
    this.setState((_, { text }) => ({
      editing: false,
      text,
    }))
  }

  update = async e => {
    e.stopPropagation()
    // if the text is empty, we should just delete the item instead of updating
    if (this.state.text === '') {
      await this.delete()
    } else {
      await this.props.update(this.props.recipeID, this.props.id, { text: this.state.text })
    }
    this.setState({
      editing: false,
      unsavedChanges: false
    })
  }

  delete = () =>
    this.props.delete(this.props.id)

  render () {
    const {
      updating,
      removing
    } = this.props

    const inner = this.state.editing
      ? <form onSubmit={
          e => {
            e.preventDefault()
            if (this.state.text === '') return
            this.add()
          }
        }>

          <div className="field">
            <div className="control">
              <Textarea
                autoFocus
                onFocus={ this.handleFocus }
                onChange={ this.handleInputChange }
                onKeyPress={ (e) => {
                  if (this.state.text === '') return
                  if (e.shiftKey && e.key === 'Enter') {
                    e.preventDefault()
                    this.update(e)
                  }
                }}
                defaultValue={ this.state.text }
                className="my-textarea"
                placeholder="Add you text here"
                name="text"/>
            </div>
          </div>
          <section className="listitem-button-container">
            <div className="field is-grouped">
              <p className="control">
                <button
                  onClick={ this.update }
                  className={ 'my-button is-small ' + (updating ? 'is-loading' : '')}
                  type="button"
                  name="save">
                  Save
                </button>
              </p>
              <p className="control">
                <input
                  onClick={ this.cancel }
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
                  onClick={ this.delete }
                  className={ 'my-button is-small ' + (removing ? 'is-loading' : '')}
                  type="button"
                  name="delete">
                  Delete
                </button>
              </p>
            </div>
          </section>
        </form>
      : <p className="listitem-text">
          { this.state.text }
        </p>

    return (
      <div ref={element => { this.element = element }}>
        <section
          className="cursor-pointer"
          onClick={this.enableEditing}>
        { inner }
        </section>
        {
          this.state.unsavedChanges &&
          <section className="d-flex justify-space-between align-center">
            <span className="is-italic">Unsaved Changes</span>
            <section>
              <a onClick={ this.enableEditing }
                className="my-button is-small is-link">
                View Edits
              </a>
              <a onClick={ this.discardChanges }
                className="my-button is-small is-link">
                Discard
              </a>
            </section>
          </section>
        }
      </div>
    )
  }
}
