import React from 'react'

import Navbar from './Nav.jsx'
import RecipeImporter from './RecipeImporter.jsx'
import PasswordChange from './PasswordChange.jsx'

import './Settings.scss'

const Settings = () => (

  <div className="container">
    <Navbar />
    <h1 className="title is-2">Settings</h1>
    <section className="columns">
      <section className="column">

        <PasswordChange />

      </section>

      <section className="column">

        <section className="box">
          <h2 className="title is-3">User</h2>

          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input className="input" type="email" placeholder="example@domain.com" required/>
            </div>

            <div className="control flex-align-center">
              <a className="button is-link">Export Recipes</a>

              <div className="select is-small">
                <select>
                  <option>as TOML</option>
                  <option>as JSON</option>
                  <option>as YAML</option>
                </select>
              </div>
            </div>
          </div>

        </section>

      </section>

      <section className="column">

        <RecipeImporter />

      </section>

    </section>
  </div>
)

export default Settings
