import React from "react"
import { Helmet as ReactHelm } from "react-helmet"

export const Helmet = ({ ...props }) => {
  return <ReactHelm {...props} defer={false} />
}
