import Raven from "raven-js"
import ReactDOM from "react-dom/client"

import { SENTRY_DSN, GIT_SHA } from "@/settings"
import App from "@/components/App"

if (process.env.NODE_ENV === "production" && SENTRY_DSN) {
  Raven.config(SENTRY_DSN, {
    release: GIT_SHA || "",
  }).install()
  console.log("version:", GIT_SHA, "\nsentry:", SENTRY_DSN)
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
