import { useEffect } from "react"
import { useHistory } from "react-router-dom"

export function ScrollRestore() {
  const history = useHistory()
  useEffect(() => {
    const unlisten = history.listen(() => {
      if (history.action !== "POP") {
        window.scroll(0, 0)
      }
    })
    return unlisten
  }, [history])
  return null
}
