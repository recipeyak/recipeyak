import React from "react"
import { useHistory, useLocation } from "react-router"

import { pathNamesEqual } from "@/url"
import { toURL } from "@/urls"

/** On load, update the recipe URL to include the slugified recipe name */
export function useAddSlugToUrl(rawPathname: string, name: string | undefined) {
  const location = useLocation()
  const history = useHistory()
  React.useEffect(() => {
    if (name == null) {
      return
    }
    const pathname = rawPathname + "-" + toURL(name)
    if (pathNamesEqual(location.pathname, pathname)) {
      return
    }
    history.replace({ pathname, search: location.search, hash: location.hash })
  }, [history, location, rawPathname, name])
}
