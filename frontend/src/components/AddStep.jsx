import React from 'react'
import PropTypes from 'prop-types'

import AddStepForm from './AddStepForm'

class AddStep extends React.Component {
  static propTypes = {
    addStep: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    id: PropTypes.number.isRequired,
  }

  state = {
    step: ''
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  clearStep = () => {
    this.props.onCancel()
    this.setState({ step: '' })
  }

  addStep = async () => {
    await this.props.addStep(this.props.id, this.state.step)
    this.setState({ step: '' })
  }

  render () {
    const {
      handleInputChange,
      addStep,
      clearStep
    } = this

    const {
      index,
      loading
    } = this.props

    const {
      step
    } = this.state

    return (
      <AddStepForm
        handleInputChange={ handleInputChange }
        addStep={ addStep }
        cancelAddStep={ clearStep }
        stepNumber={ index }
        text={ step }
        loading={ loading }
      />
    )
  }
}

export default AddStep
