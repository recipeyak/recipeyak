import React from 'react'

const AddIngredientForm = ({
  handleAddIngredient,
  cancelAddIngredient,
  handleInputChange,
  quantity,
  name,
  description,
  clearInputs,
  loading,
  error
}) =>
  <form onSubmit={ async e => {
    e.preventDefault()
    await handleAddIngredient()
    document.querySelector('#firstinput').focus()
  }
  }>
  <div className="add-ingredient-grid mb-2 mt-2">

    <div>
      <input
        id="firstinput"
        onChange={ handleInputChange }
        onFocus={ e => e.target.select() }
        value={ quantity }
        className={ 'my-input' + (error ? ' is-danger' : '') }
        type="text"
        placeholder="3 lbs"
        name="quantity"/>
    </div>

    <div>
      <input
        onChange={ handleInputChange }
        onFocus={ e => e.target.select() }
        value={ name }
        className={ 'my-input' + (error ? ' is-danger' : '') }
        type="text"
        placeholder="tomato"
        name="name"/>
    </div>

    <div className="grid-entire-row">
      <input
        onChange={ handleInputChange }
        onFocus={ e => e.target.select() }
        value={ description }
        className={ 'my-input' + (error ? ' is-danger' : '') }
        type="text"
        placeholder="diced at 3cm"
        name="description"/>
      { error
          ? <p class="fs-4 c-danger">A recipe needs at least one ingredient</p>
          : null
      }
    </div>
  </div>

  <div className="field is-grouped">
    <p className="control">
      <button
        disabled={ quantity === '' && name === '' }
        className={ 'my-button is-primary' + (loading ? ' is-loading' : '')}
        type="submit"
        name="add ingredient">
        Add
        </button>
    </p>
    <p className="control">
      { quantity !== '' || name !== ''
        ? <input
            disabled={ quantity === '' && name === '' }
            onClick={ cancelAddIngredient }
            className="my-button"
            type="button"
            name="cancel add ingredient"
            value="✕"/>
        : null
      }
    </p>
  </div>
</form>

export default AddIngredientForm
