import Raven from "raven-js"
import ReactDOM from "react-dom/client"

import App from "@/components/App"
import { GIT_SHA, SENTRY_DSN } from "@/settings"

if (process.env.NODE_ENV === "production" && SENTRY_DSN) {
  Raven.config(SENTRY_DSN, {
    release: GIT_SHA || "",
  }).install()
  console.log("version:", GIT_SHA, "\nsentry:", SENTRY_DSN)
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
