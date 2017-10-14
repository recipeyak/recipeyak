import React from 'react'
import { Link } from 'react-router-dom'
import EnhancedTextInput from './EnhancedTextInput.jsx'

import './Settings.scss'

const Settings = ({ avatarURL, email, updateEmail }) =>
  <div>
    <h1 className="title is-2">Settings</h1>
    <section className="columns">

      <section className="column">

        <div className="d-flex direction-column">
          <label className="label">Avatar</label>
          <div>
            <img alt="user profile" src={ avatarURL }/>
          </div>
          <a href="https://secure.gravatar.com">Update via Gravatar</a>
        </div>

        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <EnhancedTextInput
              showEditButton
              text={ email }
              onChange={ updateEmail }
              name="email" />
          </div>
        </div>

        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <Link to="/password">Change Password</Link>
          </div>
        </div>

        <div className="field">
          <label className="label">Color Scheme</label>
          <div className="control">
            <div className="select">
              <select>
                <option>Light</option>
                <option>Sepia</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
        </div>

        <div className="field">
          <label className="label">Export</label>

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
  </div>

export default Settings
