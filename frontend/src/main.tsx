import * as Sentry from "@sentry/react"
import ReactDOM from "react-dom/client"

import App from "@/components/App"
import { GIT_SHA, SENTRY_DSN } from "@/settings"

Sentry.init({
  dsn: SENTRY_DSN,
  release: GIT_SHA || "",
})
// eslint-disable-next-line no-console
console.log("version:", GIT_SHA, "\nsentry:", SENTRY_DSN)

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
