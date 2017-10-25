import React from 'react'

class AddStep extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addingStep: false,
      step: ''
    }
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleFocus = event => {
    event.target.select()
  }

  cancelAddStep = () => {
    this.setState({ step: '', addingStep: false })
  }

  addingStep = () => {
    this.setState({ addingStep: true })
  }

  addStep = async (id, step) => {
    await this.props.addStep(id, step)
    this.setState({ step: '' })
  }

  handleAddStep = e => {
    e.preventDefault()
    if (this.state.step === '') return
    this.addStep(this.props.id, this.state.step)
  }

  handleAddStepKeyPress = e => {
    if (this.state.step === '') return
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault()
      this.addStep(this.props.id, this.state.step)
    }
  }

  render () {
    const { state } = this
    const { index, loading } = this.props
    return (
      state.addingStep
      ? <form onSubmit={ this.handleAddStep }>
        <div className="field">
          <label className="label">Step { index }</label>
          <div className="control">
            <textarea
              onChange={ this.handleInputChange }
              onKeyPress={ this.handleAddStepKeyPress }
              autoFocus
              onFocus={ this.handleFocus }
              value={ state.step }
              className="textarea"
              placeholder="Add your step here"
              name="step"/>
          </div>
        </div>
        <div className="field is-grouped">
          <p className="control">
            <button
              disabled={ state.step === '' }
              className={ `button is-primary ${loading ? 'is-loading' : ''}` }
              type="submit"
              name="save step">
              Add
            </button>
          </p>
          <p className="control">
            <input
              onClick={ this.cancelAddStep }
              className="button"
              type="button"
              name="cancel step"
              value="✕"/>
          </p>
        </div>
      </form>
      : <p className="flex-center">
        <button
          onClick={ this.addingStep }
          className="button is-link">
          Add another
        </button>
      </p>
    )
  }
}

export default AddStep
