import React from 'react'

class AddIngredient extends React.Component {
  constructor (props) {
    super(props)

    this.emptyState = {
      addingIngredient: false,
      quantity: '',
      unit: '',
      name: '',
      description: ''
    }

    this.state = this.emptyState
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleFocus = event => {
    event.target.select()
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
    this.setState({ quantity: '', unit: '', name: '', description: '' })
  }

  addIngredient = async (id, ingredient) => {
    // TODO: pass this prop in from Recipe or via store
    const { quantity, unit, name, description } = this.state
    await this.props.addIngredient(id, { quantity, unit, name, description })
    this.clearInputs()
  }

  render () {
    const { state } = this

    const units = [
      'large',
      'small',
      'medium',
      'tsp',
      'tbsp',
      'cup',
      'lb',
      'kg',
      'mg',
      'gram',
      'liter',
      'ml',
      'gal.',
      'oz',
      'fl oz',
      'pint',
      'quart',
      'pinch',
      'inch',
      'cm',
      'm',
      'mm'
    ]

    return (
      state.addingIngredient
      ? <form onSubmit={ this.handleAddIngredient }>
        <div className="field">
          <div className="control">
            <div className="d-flex">

              <input
                onChange={ this.handleInputChange }
                autoFocus
                onFocus={ this.handleFocus }
                value={ this.state.quantity }
                className="my-input input-quantity"
                type="number"
                placeholder="3"
                name="quantity"/>

              <div className="select">
                <select
                  onChange={ this.handleInputChange }
                  name='unit'
                  value={this.state.unit}>
                  <option disabled value="-1">unit</option>
                  {
                    units.map(x =>
                      <option key={ x } value={ x }>{ x }</option>
                    )
                  }
                </select>
              </div>

              <input
                onChange={ this.handleInputChange }
                onFocus={ this.handleFocus }
                value={ this.state.name }
                className="my-input input-ingredient"
                type="text"
                placeholder="tomato"
                name="name"/>
            </div>

            <input
              onChange={ this.handleInputChange }
              onFocus={ this.handleFocus }
              value={ this.state.description }
              className="my-input input-ingredient"
              type="text"
              placeholder="diced at 3cm in width"
              name="description"/>
          </div>

        </div>
        <div className="field is-grouped">
          <p className="control">
            <input
              className="button is-primary"
              type="submit"
              name="add ingredient"
              value="Add"/>
          </p>
          <p className="control">
            <input
              onClick={ this.cancelAddIngredient }
              className="button"
              type="button"
              name="cancel add ingredient"
              value="✕"/>
          </p>
        </div>
      </form>
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
