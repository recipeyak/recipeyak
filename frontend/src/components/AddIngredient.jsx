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

  handleAddIngredient = e => {
    e.preventDefault()
    this.addIngredient(this.props.id, this.state.ingredient)
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

  addIngredient = async (id, ingredient) => {
    // TODO: pass this prop in from Recipe or via store
    const { quantity, name, description } = this.state
    await this.props.addIngredient(id, { quantity, name, description })
    this.clearInputs()
  }

  render () {
    const { state } = this

    return (
      state.addingIngredient
      ? <AddIngredientForm
          handleAddIngredient={this.handleAddIngredient}
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
