import React from 'react'

const AddIngredientForm = ({
  handleAddIngredient,
  cancelAddIngredient,
  handleInputChange,
  quantity,
  name,
  description,
  clearInputs,
  loading
}) =>
  <form onSubmit={ async e => {
    e.preventDefault()
    await handleAddIngredient()
    document.querySelector('#firstinput').focus()
  }
  }>
  <div className="field">
    <div className="add-ingredient-grid">

      <input
        id="firstinput"
        onChange={ handleInputChange }
        autoFocus
        onFocus={ e => e.target.select() }
        value={ quantity }
        className="my-input input-quantity"
        type="text"
        placeholder="3 lbs"
        name="quantity"/>

      <input
        onChange={ handleInputChange }
        onFocus={ e => e.target.select() }
        value={ name }
        className="my-input input-ingredient"
        type="text"
        placeholder="tomato"
        name="name"/>

      <input
        onChange={ handleInputChange }
        onFocus={ e => e.target.select() }
        value={ description }
        className="my-input input-ingredient grid-entire-row"
        type="text"
        placeholder="diced at 3cm in width"
        name="description"/>
    </div>

  </div>
  <div className="field is-grouped">
    <p className="control">
      <button
        className={ 'button is-primary ' + (loading ? 'is-loading' : '')}
        type="submit"
        name="add ingredient">
        Add
        </button>
    </p>
    <p className="control">
      <input
        onClick={ cancelAddIngredient }
        className="button"
        type="button"
        name="cancel add ingredient"
        value="✕"/>
    </p>
  </div>
</form>

export default AddIngredientForm
