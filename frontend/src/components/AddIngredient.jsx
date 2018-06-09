import React from 'react'
import PropTypes from 'prop-types'
import AddIngredientForm from './AddIngredientForm'

export default class AddIngredient extends React.Component {

  static propTypes = {
    id: PropTypes.number.isRequired,
    addIngredient: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    autoFocus: PropTypes.bool,
  }

  static defaultProps = {
    loading: false,
  }

  emptyState = {
    quantity: '',
    name: '',
    description: '',
    optional: false,
  }

  state = this.emptyState

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  addingIngredient = () => {
    this.setState({ addingIngredient: true })
  }

  cancelAddIngredient = () => {
    this.props.onCancel()
    this.setState(this.emptyState)
  }

  clearInputs = () => {
    this.setState(this.emptyState)
  }

  render () {
    const { clearInputs, cancelAddIngredient, handleInputChange } = this
    const { id, addIngredient, loading, autoFocus } = this.props
    const { quantity, name, description, optional } = this.state

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
        optional={optional}
        autoFocus={autoFocus}
      />
    )
  }
}
