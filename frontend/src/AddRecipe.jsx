import React from 'react'
import PropTypes from 'prop-types'

import Navbar from './Nav.jsx'

import './add-recipe.scss'

const AddRecipe = () => (
  <div className="container">
    <Navbar />
    <h1 className="title is-2">Add Recipe</h1>
    <div className="field">
      <div className="control">
        <input className="input input-title" type="text" placeholder="title" name="title"/>
      </div>
    </div>
    <div className="input-container">
      <input className="input input-author" type="text" placeholder="Author" name="author"/>
      <input className="input input-source" type="text" placeholder="http://example.com/dumpling-soup" name="source"/>
      <input className="input input-time" type="text" placeholder="1 hour" name="time"/>
    </div>

    <div className="container">
      <div className="columns">
        <div className="column is-one-third">
          <h2 className="title">Ingredients</h2>
          <div className="box">
            <div className="field">
              <div className="control">
                <input className="input input-ingredient" type="text" placeholder="Add your ingredient here" name="ingredient"/>
              </div>
            </div>
            <div className="field is-grouped">
              <p className="control">
                <input className="button is-primary" type="button" name="save ingredient" value="Add"/>
              </p>
              <p className="control">
                <input className="button" type="button" name="cancel ingredient" value="✕"/>
              </p>
            </div>
          </div>
        </div>

        <div className="column">
          <h2 className="title is-3">Preparation</h2>
          <div className="box">
            <div className="field">
              <label className="label">Step 1</label>
              <div className="control">
                <textarea className="textarea" placeholder="Add your step here"/>
              </div>
            </div>
            <div className="field is-grouped">
              <p className="control">
                <input className="button is-primary" type="button" name="save step" value="Add"/>
              </p>
              <p className="control">
                <input className="button" type="button" name="cancel ingredient" value="✕"/>
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="flex-center">
        <input
          className="button is-large is-primary"
          type="button"
          name="cancel ingredient"
          value="Create Recipe"/>
      </p>
    </div>
  </div>
)

AddRecipe.PropTypes = {
  AddRecipe: PropTypes.func.isRequired,
}

export default AddRecipe
