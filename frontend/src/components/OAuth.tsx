import React, { useEffect } from "react"

import Loader from "@/components/Loader"
import { SocialProvider } from "@/store/reducers/user"

interface IOAuthProps {
  readonly service: SocialProvider
  readonly token: string
  readonly login: () => void
  readonly redirectUrl?: string
}

const OAuth = ({ service, login }: IOAuthProps) => {
  useEffect(() => {
    login()
  }, [login])

  return (
    <div className="d-flex justify-content-center direction-column align-items-center h-100 mt-5rem">
      <p className="mb-4 fs-8">Signing in via {service}</p>
      <Loader />
    </div>
  )
}

export default OAuth
