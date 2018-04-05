import * as React from 'react'
import AddIngredientForm from './AddIngredientForm'

class AddIngredient extends React.Component {
  constructor (props) {
    super(props)

    this.emptyState = {
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
    const { clearInputs, cancelAddIngredient, handleInputChange } = this
    const { id, addIngredient, loading } = this.props
    const { quantity, name, description } = this.state

    return (
      <AddIngredientForm
        handleAddIngredient={
          async () => {
            await addIngredient(id, { quantity, name, description })
            clearInputs()
          }
        }
        loading={ loading }
        cancelAddIngredient={ cancelAddIngredient }
        handleInputChange={ handleInputChange }
        quantity={ quantity }
        name={ name }
        description={ description }
      />
    )
  }
}

export default AddIngredient
