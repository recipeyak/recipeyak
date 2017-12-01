import React from 'react'
import AddIngredientForm from './AddIngredientForm'

class AddIngredient extends React.Component {
  constructor (props) {
    super(props)

    this.emptyState = {
      addingIngredient: false,
      quantity: '',
      name: '',
      description: ''
    }

    this.state = this.emptyState
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  addingIngredient = () => {
    this.setState({ addingIngredient: true })
  }

  cancelAddIngredient = () => {
    this.setState(this.emptyState)
  }

  clearInputs = () => {
    this.setState({ quantity: '', name: '', description: '' })
  }

  render () {
    const { state, clearInputs } = this
    const { id, addIngredient, loading } = this.props
    const { quantity, name, description } = this.state

    return (
      state.addingIngredient
      ? <AddIngredientForm
          handleAddIngredient={
            async () => {
              await addIngredient(id, { quantity, name, description })
              clearInputs()
            }
          }
          loading={loading}
          cancelAddIngredient={this.cancelAddIngredient}
          handleInputChange={this.handleInputChange}
          quantity={this.state.quantity}
          name={this.state.name}
          description={this.state.description}
        />
      : <p className="flex-center">
        <button
          onClick={ this.addingIngredient }
          className="button is-link">
          Add another
        </button>
      </p>
    )
  }
}

export default AddIngredient
