import React from 'react'

import { ButtonPrimary } from './Buttons'

const AddIngredientForm = ({
  handleAddIngredient,
  cancelAddIngredient,
  handleInputChange,
  quantity,
  name,
  description,
  optional,
  loading,
  error,
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
        autoFocus
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
          ? <p className="fs-4 c-danger">A recipe needs at least one ingredient</p>
          : null
      }
    </div>
  </div>

  <label className="d-flex align-items-center cursor-pointer mb-2">
  <input
    onChange={ handleInputChange }
    checked={ optional }
    name="optional"
    type='checkbox'
    className="mr-2"/>
    Optional
  </label>

  <div className="field is-grouped">
    <p className="control">
      <ButtonPrimary
        disabled={ quantity === '' && name === '' }
        className="is-small"
        type="submit"
        name="add ingredient"
        loading={ loading }>
        Add
      </ButtonPrimary>
    </p>
    <p className="control">
      <input
        onClick={ cancelAddIngredient }
        className="my-button is-small"
        type="button"
        name="cancel add ingredient"
        value="cancel"/>
    </p>
  </div>
</form>

export default AddIngredientForm
