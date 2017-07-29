import React from 'react'

const UserManagement = () => (
  <section className="box">
    <h2 className="title is-3">User</h2>

    <div className="field">
      <label className="label">Email</label>
      <div className="control">
        <input className="input" type="email" placeholder="example@domain.com" required/>
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
)

export default UserManagement
