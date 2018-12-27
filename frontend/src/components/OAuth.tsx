import React from "react"

import Loader from "@/components/Loader"
import { SocialProvider } from "@/store/reducers/user"

interface IOAuthProps {
  readonly service: SocialProvider
  readonly token: string
  readonly login: (
    service: SocialProvider,
    token: string,
    redirectUrl: string
  ) => void
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
