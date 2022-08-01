import * as React from "react"
import { Helmet as ReactHelm } from "react-helmet-async"

export const Helmet = (props: React.ComponentProps<typeof ReactHelm>) => {
  return (
    <ReactHelm
      {...props}
      defer={false}
      defaultTitle="Recipe Yak"
      titleTemplate="%s | Recipe Yak"
    />
  )
}
