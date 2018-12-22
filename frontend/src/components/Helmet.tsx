import * as React from "react"
import { Helmet as ReactHelm, HelmetProps } from "react-helmet"

export const Helmet = (props: HelmetProps) => {
  return <ReactHelm {...props} defer={false} />
}
