import React from 'react'

import Loader from './Loader'

const OAuth = ({ service, token, login, redirectUrl }) => {
  login(service, token, redirectUrl)

  return (
    <div className="d-flex justify-content-center direction-column align-items-center">
      <p className="mb-4 fs-8">Signing in...</p>
      <Loader/>
    </div>
  )
}

export default OAuth
