import React from 'react'

import RecipeImporter from './RecipeImporter.jsx'
import PasswordChange from '../containers/PasswordChange.jsx'
import UserManagement from './UserManagement.jsx'
import ReceiptUploader from './ReceiptUploader.jsx'

import './Settings.scss'

const Settings = () => (
  <div>
    <h1 className="title is-2">Settings</h1>
    <section className="columns">
      <section className="column">

        <PasswordChange />

      </section>

      <section className="column">

        <UserManagement/>

      </section>

      <section className="column">

        <RecipeImporter />

        <ReceiptUploader />

      </section>

    </section>
  </div>
)

export default Settings
