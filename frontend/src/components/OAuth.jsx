import React from 'react'

const OAuth = ({service, token, login}) => {
  login(service, token)

  return (
    <p>Signing into {service} with token {token}...</p>
  )}

export default OAuth
