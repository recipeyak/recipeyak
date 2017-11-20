import React from 'react'

const AddIngredientForm = ({
  handleAddIngredient,
  cancelAddIngredient,
  handleInputChange,
  quantity,
  name,
  description
}) =>
  <form onSubmit={ handleAddIngredient }>
    <div className="field">
      <div className="control">
        <div className="d-flex">

          <input
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
        </div>

        <input
          onChange={ handleInputChange }
          onFocus={ e => e.target.select() }
          value={ description }
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
          onClick={ cancelAddIngredient }
          className="button"
          type="button"
          name="cancel add ingredient"
          value="✕"/>
      </p>
    </div>
  </form>

export default AddIngredientForm
