import Raven from "raven-js"
import ReactDOM from "react-dom/client"

import { Provider } from "react-redux"

import { SENTRY_DSN, GIT_SHA } from "@/settings"
import App from "@/components/App"
import store from "@/store/store"
import { ThemeProvider, theme } from "@/theme"

if (process.env.NODE_ENV === "production" && SENTRY_DSN) {
  Raven.config(SENTRY_DSN, {
    release: GIT_SHA || "",
  }).install()
  console.log("version:", GIT_SHA, "\nsentry:", SENTRY_DSN)
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <App />
    </Provider>
  </ThemeProvider>,
)
