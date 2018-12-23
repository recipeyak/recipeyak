import React from "react"

import Loader from "./Loader"

interface IOAuthProps {
  readonly service: string
  readonly token: string
  readonly login: (service: string, token: string, redirectUrl: string) => void
  readonly redirectUrl?: string
}

const OAuth = ({ service, token, login, redirectUrl = "" }: IOAuthProps) => {
  login(service, token, redirectUrl)

  return (
    <div className="d-flex justify-content-center direction-column align-items-center">
      <p className="mb-4 fs-8">Signing in...</p>
      <Loader />
    </div>
  )
}

export default OAuth
